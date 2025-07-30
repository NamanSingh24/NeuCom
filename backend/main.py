from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import os
import tempfile
import shutil
from pathlib import Path
from typing import List, Optional, Dict, Any, BinaryIO
import uvicorn
import logging
from datetime import datetime
import mimetypes
from io import BytesIO

# Import our modules
from document_processor import DocumentProcessor
from rag_engine import RAGEngine
from groq_client import GroqClient
from voice_handler import VoiceHandler
from sop_chat import SOPChat
# Knowledge Graph Ingestion
from Knowledge_Graph.ingestion import get_neo4j_driver, ingest_sop_to_kg
import uuid

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Live SOP Interpreter API",
    description="Voice-interactive SOP interpreter with RAG implementation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        os.getenv("FRONTEND_URL")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize components
doc_processor = DocumentProcessor()
rag_engine = RAGEngine()
groq_client = GroqClient()

# Initialize voice handler (optional)
try:
    voice_handler = VoiceHandler()
    voice_available = True
    logger.info("Voice handler initialized successfully")
except Exception as e:
    logger.warning(f"Voice handler initialization failed: {str(e)}")
    logger.info("Voice features will be disabled. To enable:")
    logger.info("1. Install dependencies: pip install openai-whisper torch")
    logger.info("2. Install eSpeak: brew install espeak (macOS) or sudo apt-get install espeak (Linux)")
    voice_handler = None
    voice_available = False

# Initialize SOP chat
sop_chat = SOPChat(rag_engine, groq_client, voice_handler)

# Neo4j health check on startup
try:
    kg_driver = get_neo4j_driver()
    with kg_driver.session() as session:
        session.run("RETURN 1")
    logger.info("Neo4j connection healthy: Successfully connected and ran test query.")
except Exception as e:
    logger.error(f"Neo4j health check failed: {e}")

# Pydantic models
class QueryRequest(BaseModel):
    query: str = Field(..., description="User query about SOP")
    voice_enabled: bool = Field(default=False, description="Enable voice response")
    context_filter: Optional[Dict] = Field(default=None, description="Filter for document search")

class QueryResponse(BaseModel):
    response: str
    intent: Dict[str, Any]
    sources: List[str]
    confidence: float
    context_used: bool
    current_procedure: Optional[str] = None
    safety_information: Optional[List[str]] = None
    usage: Optional[Dict] = None

class ProcedureRequest(BaseModel):
    procedure_name: str = Field(..., description="Name of the procedure to start")

class UserPreferencesRequest(BaseModel):
    voice_enabled: bool = Field(default=False)
    voice_speed: float = Field(default=1.0, ge=0.25, le=4.0)
    auto_advance_steps: bool = Field(default=False)
    safety_reminders: bool = Field(default=True)

class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    filename: str
    chunks_created: int
    file_type: str
    file_size_mb: float

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "document_processor": "ok",
            "rag_engine": "ok",
            "groq_client": "ok",
            "voice_handler": "ok" if voice_available else "disabled",
            "voice_system": "open-source" if voice_available else "none"
        }
    }

# Document upload endpoint
@app.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process SOP document"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.docx', '.md', '.txt']
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        
        # Handle file overwrite
        if file_path.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            name_part = file_path.stem
            file_path = UPLOAD_DIR / f"{name_part}_{timestamp}{file_ext}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        file_size_mb = len(content) / (1024 * 1024)
        
        # Process document
        try:
            chunks = doc_processor.process_document(str(file_path))
            
            # Add to RAG engine
            rag_result = rag_engine.add_documents(chunks)
            
            if rag_result["status"] != "success":
                raise Exception(f"RAG processing failed: {rag_result.get('message', 'Unknown error')}")
            
            logger.info(f"Successfully processed {file.filename}: {len(chunks)} chunks created")
            
            # Build SOP data structure
            sop_id = str(uuid.uuid4())
            sop_data = {
                "id": sop_id,
                "title": Path(file_path).stem,
                "file_type": file_ext,
                "source": str(file_path),
                "created_at": datetime.now().isoformat(),
                "steps": []
            }

            for i, chunk in enumerate(chunks):
                step_id = f"{sop_id}_step_{i}"
                sop_data["steps"].append({
                    "id": step_id,
                    "description": chunk["text"],
                    "order": i,
                    "chunk_id": chunk["chunk_id"],
                    "tools": [],  # If you have tool extraction logic, add here
                    "materials": [],  # If you have material extraction logic, add here
                    "safety_notes": chunk.get("safety_notes", [])
                })
            
            # Store in Neo4j
            try:
                kg_driver = get_neo4j_driver()
                ingest_sop_to_kg(sop_data, kg_driver)
                logger.info(f"SOP stored in Neo4j with id {sop_id}")
            except Exception as e:
                logger.error(f"Failed to store SOP in Neo4j: {e}")
                logger.warning(f"Upload succeeded but SOP was NOT stored in Neo4j for file: {file.filename}")
                # Optionally, you can raise an HTTPException here if you want to fail the upload
            
            return DocumentUploadResponse(
                success=True,
                message=f"Successfully processed {file.filename}",
                filename=file.filename,
                chunks_created=len(chunks),
                file_type=file.content_type or mimetypes.guess_type(file.filename)[0] or file_ext,
                file_size_mb=round(file_size_mb, 2)
            )
            
        except Exception as processing_error:
            # Clean up file if processing failed
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500, 
                detail=f"Document processing failed: {str(processing_error)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Query endpoint
@app.post("/query", response_model=QueryResponse)
async def query_sop(request: QueryRequest):
    """Query the SOP system"""
    try:
        # Update voice preference
        sop_chat.set_user_preferences({"voice_enabled": request.voice_enabled})
        
        # Process query
        response = sop_chat.process_query(request.query, request.context_filter)
        
        return QueryResponse(**response)
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

# Voice endpoints
@app.post("/voice/upload")
async def process_voice_upload(audio_file: UploadFile = File(...)):
    """Process uploaded audio file for speech-to-text"""
    try:
        if not voice_handler:
            raise HTTPException(status_code=503, detail="Voice functionality not available")
        
        # Simple validation - just check the file extension
        filename = audio_file.filename or "recording.webm"
        file_ext = Path(filename).suffix.lower()
        supported_formats = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm', '.ogg']
        
        if file_ext not in supported_formats:
            raise HTTPException(status_code=400, detail=f"Unsupported audio format: {file_ext}")
        
        # Create temporary file with proper suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Process audio
            with open(temp_file_path, 'rb') as audio_fp:
                response = sop_chat.process_voice_input(audio_fp)
            
            return response
            
        finally:
            # Clean up temp file
            os.unlink(temp_file_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")

@app.post("/voice/synthesize")
async def synthesize_speech(text: str, voice_id: str = "alloy", speed: float = 1.0):
    """Convert text to speech"""
    try:
        if not voice_handler:
            raise HTTPException(status_code=503, detail="Voice functionality not available")
        
        # Change voice if requested
        if voice_id != voice_handler.tts_voice:
            voice_handler.change_voice(voice_id)
        
        # Generate audio
        audio_data = voice_handler.text_to_speech(text, speed=speed)
        
        # Return as streaming response
        return StreamingResponse(
            BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=response.mp3"}
        )
        
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

# Procedure management endpoints
@app.post("/procedure/start")
async def start_procedure(request: ProcedureRequest):
    """Start a specific procedure"""
    try:
        result = sop_chat.start_procedure(request.procedure_name)
        return result
    except Exception as e:
        logger.error(f"Error starting procedure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/procedure/next")
async def next_step():
    """Move to next step in current procedure"""
    try:
        result = sop_chat.next_step()
        return result
    except Exception as e:
        logger.error(f"Error moving to next step: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/procedure/previous")
async def previous_step():
    """Move to previous step in current procedure"""
    try:
        result = sop_chat.previous_step()
        return result
    except Exception as e:
        logger.error(f"Error moving to previous step: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/procedure/current")
async def get_current_step():
    """Get current step information"""
    try:
        result = sop_chat.get_current_step()
        return result
    except Exception as e:
        logger.error(f"Error getting current step: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/procedure/status")
async def get_procedure_status():
    """Get current procedure status"""
    try:
        result = sop_chat.get_procedure_status()
        return result
    except Exception as e:
        logger.error(f"Error getting procedure status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/procedure/end")
async def end_procedure():
    """End current procedure"""
    try:
        result = sop_chat.end_procedure()
        return result
    except Exception as e:
        logger.error(f"Error ending procedure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/procedures")
async def get_available_procedures():
    """Get list of available procedures"""
    try:
        procedures = sop_chat.get_available_procedures()
        return {"procedures": procedures}
    except Exception as e:
        logger.error(f"Error getting procedures: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# User preferences
@app.post("/preferences")
async def update_user_preferences(request: UserPreferencesRequest):
    """Update user preferences"""
    try:
        preferences = request.dict()
        sop_chat.set_user_preferences(preferences)
        return {"success": True, "preferences": preferences}
    except Exception as e:
        logger.error(f"Error updating preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# System information endpoints
@app.get("/stats")
async def get_system_stats():
    """Get system statistics"""
    try:
        rag_stats = rag_engine.get_collection_stats()
        conversation_stats = {
            "conversation_length": len(sop_chat.get_conversation_history()),
            "current_procedure": sop_chat.current_procedure["name"] if sop_chat.current_procedure else None
        }
        
        voice_info = {}
        if voice_handler:
            voice_info = voice_handler.get_voice_info()
        
        groq_info = groq_client.get_model_info()
        
        return {
            "rag_engine": rag_stats,
            "conversation": conversation_stats,
            "voice_handler": voice_info,
            "llm": groq_info,
            "supported_formats": doc_processor.allowed_extensions
        }
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversation/history")
async def get_conversation_history(limit: int = 20):
    """Get conversation history"""
    try:
        history = sop_chat.get_conversation_history(limit)
        return {"history": history}
    except Exception as e:
        logger.error(f"Error getting conversation history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversation/clear")
async def clear_conversation():
    """Clear conversation history"""
    try:
        sop_chat.clear_conversation()
        return {"success": True, "message": "Conversation history cleared"}
    except Exception as e:
        logger.error(f"Error clearing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/voice/voices")
async def get_available_voices():
    """Get available TTS voices"""
    try:
        if not voice_handler:
            raise HTTPException(status_code=503, detail="Voice functionality not available")
        
        voices = voice_handler.get_available_voices()
        return {"voices": voices}
    except Exception as e:
        logger.error(f"Error getting voices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Document management
@app.get("/documents")
async def list_uploaded_documents():
    """List uploaded documents"""
    try:
        documents = []
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                summary = doc_processor.get_document_summary(str(file_path))
                documents.append(summary)
        
        return {"documents": documents}
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    """Delete uploaded document and its vectors"""
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete from vector database
        delete_result = rag_engine.delete_documents_by_source(filename)
        
        # Delete file
        file_path.unlink()
        
        return {
            "success": True,
            "message": f"Document {filename} deleted successfully",
            "vector_deletion": delete_result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    logger.info("🚀 Starting Live SOP Interpreter API...")
    logger.info(f"📝 Upload directory: {UPLOAD_DIR}")
    logger.info(f"🗣️ Voice functionality: {'Enabled' if voice_handler else 'Disabled'}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info("📚 Make sure to set your API keys in .env file")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
