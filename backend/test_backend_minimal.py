#!/usr/bin/env python3
"""
Minimal test server to test voice functionality without ChromaDB
"""

import sys
import os
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from voice_handler import VoiceHandler
    VOICE_AVAILABLE = True
except Exception as e:
    print(f"Voice functionality not available: {e}")
    VOICE_AVAILABLE = False

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SOP Voice Test API",
    description="Test API for open-source voice functionality",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize voice handler
voice_handler = None
if VOICE_AVAILABLE:
    try:
        voice_handler = VoiceHandler()
        logger.info("✅ Voice handler initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize voice handler: {e}")
        VOICE_AVAILABLE = False

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SOP Voice Test API",
        "voice_available": VOICE_AVAILABLE,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "voice_available": VOICE_AVAILABLE
    }
    
    if VOICE_AVAILABLE and voice_handler:
        try:
            # Test voice dependencies
            deps = voice_handler.check_dependencies()
            health_status["voice_dependencies"] = deps
            health_status["voice_info"] = voice_handler.get_voice_info()
            health_status["available_voices"] = len(voice_handler.get_available_voices())
        except Exception as e:
            health_status["voice_error"] = str(e)
    
    return health_status

@app.post("/api/tts")
async def text_to_speech(request_data: dict):
    """Convert text to speech"""
    if not VOICE_AVAILABLE or not voice_handler:
        raise HTTPException(status_code=503, detail="Voice functionality not available")
    
    try:
        text = request_data.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Generate speech
        audio_data = voice_handler.text_to_speech(
            text=text,
            voice=request_data.get("voice", "default"),
            speed=request_data.get("speed", 1.0)
        )
        
        return {
            "success": True,
            "audio_size": len(audio_data) if audio_data else 0,
            "text": text,
            "message": "Speech generated successfully"
        }
        
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.post("/api/stt") 
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert speech to text"""
    if not VOICE_AVAILABLE or not voice_handler:
        raise HTTPException(status_code=503, detail="Voice functionality not available")
    
    try:
        # Read audio file
        audio_data = await audio.read()
        
        if not audio_data:
            raise HTTPException(status_code=400, detail="No audio data received")
        
        # Create a temporary file-like object
        from io import BytesIO
        audio_file = BytesIO(audio_data)
        
        # Transcribe audio
        result = voice_handler.speech_to_text(audio_file)
        
        return {
            "success": True,
            "transcription": result.get("text", ""),
            "confidence": result.get("confidence", 0.0),
            "language": result.get("language", "unknown"),
            "audio_size": len(audio_data)
        }
        
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")

if __name__ == "__main__":
    logger.info("🚀 Starting SOP Voice Test Server...")
    logger.info(f"Voice functionality: {'✅ Available' if VOICE_AVAILABLE else '❌ Not available'}")
    
    uvicorn.run(
        "test_backend_minimal:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
