from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from API.user_preferences import router as user_preferences_router
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

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Fix tokenizers parallelism warning
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Import our modules
from document_processor import DocumentProcessor
from rag_engine import RAGEngine
from groq_client import GroqClient
from voice_handler import VoiceHandler, DEFAULT_FRIENDLY_VOICE
from sop_chat import SOPChat
# Knowledge Graph Ingestion
from Knowledge_Graph.ingestion import get_neo4j_driver, ingest_sop_to_kg
import uuid



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
# Include user preferences router
app.include_router(user_preferences_router)

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
    kg_available = True
except Exception as e:
    logger.error(f"Neo4j health check failed: {e}")
    logger.warning("Knowledge Graph features will be limited")
    kg_driver = None
    kg_available = False

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
    tts_voice: Optional[str] = Field(default=None)
    auto_advance_steps: bool = Field(default=False)
    safety_reminders: bool = Field(default=True)

class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    filename: str
    chunks_created: int
    file_type: str
    file_size_mb: float

class SettingsRequest(BaseModel):
    # General Settings
    language: Optional[str] = Field(default="en")
    timezone: Optional[str] = Field(default="UTC")
    theme: Optional[str] = Field(default="light")
    auto_save: Optional[bool] = Field(default=True)
    notifications: Optional[bool] = Field(default=True)
    
    # Security Settings
    two_factor_auth: Optional[bool] = Field(default=False)
    session_timeout: Optional[int] = Field(default=30, ge=5, le=480)
    password_expiry: Optional[int] = Field(default=90, ge=30, le=365)
    ip_whitelist: Optional[str] = Field(default="")
    
    # AI Settings
    ai_model: Optional[str] = Field(default="llama-3.1-8b-instant")
    response_length: Optional[str] = Field(default="medium")
    confidence: Optional[float] = Field(default=0.8, ge=0.0, le=1.0)
    voice_enabled: Optional[bool] = Field(default=True)
    auto_processing: Optional[bool] = Field(default=True)
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=1000, ge=100, le=4000)
    
    # System Settings
    max_file_size: Optional[int] = Field(default=50, ge=1, le=500)  # MB
    chunk_size: Optional[int] = Field(default=1000, ge=100, le=4000)
    chunk_overlap: Optional[int] = Field(default=200, ge=0, le=1000)
    embedding_model: Optional[str] = Field(default="all-MiniLM-L6-v2")
    max_search_results: Optional[int] = Field(default=5, ge=1, le=20)
    backup_frequency: Optional[str] = Field(default="daily")
    log_level: Optional[str] = Field(default="info")
    
    # Voice Settings
    tts_voice: Optional[str] = Field(default=DEFAULT_FRIENDLY_VOICE)
    stt_model: Optional[str] = Field(default="base")
    voice_speed: Optional[float] = Field(default=1.0, ge=0.25, le=4.0)
    
    # Notification Settings
    email_notifications: Optional[bool] = Field(default=True)
    push_notifications: Optional[bool] = Field(default=False)
    document_processed: Optional[bool] = Field(default=True)
    system_alerts: Optional[bool] = Field(default=True)
    weekly_reports: Optional[bool] = Field(default=False)

class SettingsResponse(BaseModel):
    success: bool
    message: str
    settings: Dict[str, Any]

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
            "voice_system": "open-source" if voice_available else "none",
            "knowledge_graph": "ok" if kg_available else "disabled"
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
            if kg_available:
                try:
                    ingest_sop_to_kg(sop_data, kg_driver)
                    logger.info(f"SOP stored in Neo4j with id {sop_id}")
                except Exception as e:
                    logger.error(f"Failed to store SOP in Neo4j: {e}")
                    logger.warning(f"Upload succeeded but SOP was NOT stored in Neo4j for file: {file.filename}")
            else:
                logger.warning(f"Neo4j not available - SOP {sop_id} not stored in Knowledge Graph")
            
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
            if voice_handler.change_voice(voice_id):
                sop_chat.set_user_preferences({"tts_voice": voice_id})

        # Generate audio
        audio_data = voice_handler.text_to_speech(text, voice=voice_id, speed=speed)

        # Return as streaming response
        return StreamingResponse(
            BytesIO(audio_data),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=response.wav"}
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

# Knowledge Graph endpoints
@app.get("/kg/status")
async def get_kg_status():
    """Get Knowledge Graph status and statistics"""
    try:
        if not kg_available:
            return {
                "available": False,
                "message": "Knowledge Graph not available",
                "neo4j_connection": False
            }
        
        # Get basic KG statistics
        try:
            with kg_driver.session() as session:
                # Count nodes and relationships
                node_count = session.run("MATCH (n) RETURN count(n) as count").single()["count"]
                rel_count = session.run("MATCH ()-[r]->() RETURN count(r) as count").single()["count"]
                sop_count = session.run("MATCH (s:SOP) RETURN count(s) as count").single()["count"]
                step_count = session.run("MATCH (s:Step) RETURN count(s) as count").single()["count"]
                
                return {
                    "available": True,
                    "neo4j_connection": True,
                    "statistics": {
                        "total_nodes": node_count,
                        "total_relationships": rel_count,
                        "sop_count": sop_count,
                        "step_count": step_count
                    }
                }
        except Exception as e:
            logger.error(f"Error getting KG statistics: {e}")
            return {
                "available": True,
                "neo4j_connection": False,
                "error": str(e)
            }
    except Exception as e:
        logger.error(f"Error checking KG status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/kg/entities/{entity_name}")
async def get_entity_steps(entity_name: str):
    """Get steps related to a specific entity"""
    try:
        if not kg_available:
            raise HTTPException(status_code=503, detail="Knowledge Graph not available")
        
        # Import the entity query function
        from Knowledge_Graph.kg_utils import get_steps_related_to_entity
        
        steps = get_steps_related_to_entity(entity_name, kg_driver)
        return {
            "entity": entity_name,
            "related_steps": steps,
            "count": len(steps)
        }
    except Exception as e:
        logger.error(f"Error getting entity steps: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/kg/sops")
async def list_kg_sops():
    """List all SOPs in the Knowledge Graph"""
    try:
        if not kg_available:
            raise HTTPException(status_code=503, detail="Knowledge Graph not available")
        
        with kg_driver.session() as session:
            result = session.run("""
                MATCH (s:SOP)
                OPTIONAL MATCH (s)-[:HAS_STEP]->(step:Step)
                RETURN s.id as sop_id, s.title as title, s.created_at as created_at,
                       count(step) as step_count
                ORDER BY s.created_at DESC
            """)
            
            sops = []
            for record in result:
                sops.append({
                    "id": record["sop_id"],
                    "title": record["title"],
                    "created_at": record["created_at"],
                    "step_count": record["step_count"]
                })
            
            return {"sops": sops, "total": len(sops)}
    except Exception as e:
        logger.error(f"Error listing KG SOPs: {str(e)}")
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

@app.get("/files/chunks")
async def get_file_chunks():
    """
    Get chunk counts for each uploaded document in the uploads folder using the RAG engine.
    """
    try:
        files_chunks = []
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                # Get chunk count from RAG engine
                chunk_count = rag_engine.get_chunk_count_by_source(file_path.name)
                files_chunks.append({
                    "name": file_path.name,
                    "chunk_count": chunk_count
                })
        return {
            "success": True,
            "files": files_chunks,
            "total_files": len(files_chunks)
        }
    except Exception as e:
        logger.error(f"Error getting file chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Settings endpoints
@app.get("/settings")
async def get_settings():
    """Get current application settings"""
    try:
        current_settings = {
            # General Settings
            "language": os.getenv("LANGUAGE", "en"),
            "timezone": os.getenv("TIMEZONE", "UTC"),
            "theme": "light",  # Default theme
            "auto_save": True,
            "notifications": True,
            
            # AI Settings
            "ai_model": os.getenv("LLM_MODEL", "llama-3.1-8b-instant"),
            "response_length": "medium",
            "confidence": 0.8,
            "voice_enabled": True,
            "auto_processing": True,
            "temperature": float(os.getenv("TEMPERATURE", "0.3")),
            "max_tokens": int(os.getenv("MAX_TOKENS", "1000")),
            
            # System Settings
            "max_file_size": int(os.getenv("MAX_FILE_SIZE", "50").replace("MB", "")),
            "chunk_size": int(os.getenv("CHUNK_SIZE", "1000")),
            "chunk_overlap": int(os.getenv("CHUNK_OVERLAP", "200")),
            "embedding_model": os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
            "max_search_results": int(os.getenv("MAX_SEARCH_RESULTS", "5")),
            "backup_frequency": "daily",
            "log_level": "info",
            
            # Voice Settings
            "tts_voice": os.getenv("TTS_VOICE", DEFAULT_FRIENDLY_VOICE),
            "stt_model": os.getenv("STT_MODEL", "base"),
            "voice_speed": 1.0,
            
            # Security Settings (defaults)
            "two_factor_auth": False,
            "session_timeout": 30,
            "password_expiry": 90,
            "ip_whitelist": "",
            
            # Notification Settings (defaults)
            "email_notifications": True,
            "push_notifications": False,
            "document_processed": True,
            "system_alerts": True,
            "weekly_reports": False
        }
        
        return {
            "success": True,
            "settings": current_settings
        }
    except Exception as e:
        logger.error(f"Error getting settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/settings", response_model=SettingsResponse)
async def update_settings(settings: SettingsRequest):
    """Update application settings"""
    try:
        updated_settings = {}
        
        # Map settings to environment variables and update .env file
        env_mappings = {
            "ai_model": "LLM_MODEL",
            "temperature": "TEMPERATURE", 
            "max_tokens": "MAX_TOKENS",
            "max_file_size": "MAX_FILE_SIZE",
            "chunk_size": "CHUNK_SIZE",
            "chunk_overlap": "CHUNK_OVERLAP",
            "embedding_model": "EMBEDDING_MODEL",
            "max_search_results": "MAX_SEARCH_RESULTS",
            "tts_voice": "TTS_VOICE",
            "stt_model": "STT_MODEL"
        }
        
        # Update environment variables
        for setting_key, env_key in env_mappings.items():
            if hasattr(settings, setting_key):
                value = getattr(settings, setting_key)
                if value is not None:
                    os.environ[env_key] = str(value)
                    updated_settings[setting_key] = value
        
        # For non-env settings, just track them in response
        non_env_settings = [
            "language", "timezone", "theme", "auto_save", "notifications",
            "response_length", "confidence", "voice_enabled", "auto_processing",
            "backup_frequency", "log_level", "voice_speed", "two_factor_auth",
            "session_timeout", "password_expiry", "ip_whitelist",
            "email_notifications", "push_notifications", "document_processed",
            "system_alerts", "weekly_reports"
        ]
        
        for setting_key in non_env_settings:
            if hasattr(settings, setting_key):
                value = getattr(settings, setting_key)
                if value is not None:
                    updated_settings[setting_key] = value
        
        # Note: In a production app, you would save these to a database
        # or persistent configuration file
        
        return SettingsResponse(
            success=True,
            message=f"Successfully updated {len(updated_settings)} settings",
            settings=updated_settings
        )
        
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/settings/reset")
async def reset_settings():
    """Reset settings to default values"""
    try:
        # Reset to default environment values
        default_env = {
            "LLM_MODEL": "llama-3.1-8b-instant",
            "TEMPERATURE": "0.3",
            "MAX_TOKENS": "1000",
            "MAX_FILE_SIZE": "50MB",
            "CHUNK_SIZE": "1000",
            "CHUNK_OVERLAP": "200",
            "EMBEDDING_MODEL": "all-MiniLM-L6-v2",
            "MAX_SEARCH_RESULTS": "5",
            "TTS_VOICE": DEFAULT_FRIENDLY_VOICE,
            "STT_MODEL": "base"
        }
        
        for key, value in default_env.items():
            os.environ[key] = value
        
        return {
            "success": True,
            "message": "Settings reset to default values",
            "reset_count": len(default_env)
        }
        
    except Exception as e:
        logger.error(f"Error resetting settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# File information endpoint
@app.get("/files")
async def get_uploaded_files():
    """Get simple file information (names and sizes) from uploads folder"""
    try:
        files = []
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                file_size_bytes = file_path.stat().st_size
                file_size_mb = round(file_size_bytes / (1024 * 1024), 2)
                files.append({
                    "name": file_path.name,
                    "size_bytes": file_size_bytes,
                    "size_mb": file_size_mb,
                    "modified_at": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                })
        
        return {
            "success": True,
            "files": files,
            "total_files": len(files),
            "total_size_mb": round(sum(f["size_mb"] for f in files), 2)
        }
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.set_start_method('spawn', force=True)  # Fix semaphore issues
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    logger.info("🚀 Starting Live SOP Interpreter API...")
    logger.info(f"📝 Upload directory: {UPLOAD_DIR}")
    logger.info(f"🗣️ Voice functionality: {'Enabled' if voice_handler else 'Disabled'}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info("📚 Make sure to set your API keys in .env file")
    
    try:
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=debug,
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
    finally:
        # Cleanup resources
        logger.info("🧹 Cleaning up resources...")
        
        # Cleanup RAG engine (includes KG driver)
        try:
            rag_engine.close()
        except Exception as e:
            logger.warning(f"RAG engine cleanup error: {e}")
        
        # Cleanup KG driver
        if kg_available and kg_driver:
            try:
                kg_driver.close()
                logger.info("Knowledge Graph driver closed")
            except Exception as e:
                logger.warning(f"KG driver cleanup error: {e}")
        
        if voice_handler:
            try:
                # Add any voice handler cleanup if needed
                pass
            except Exception as e:
                logger.warning(f"Voice handler cleanup error: {e}")
        
        logger.info("✅ Cleanup completed")
