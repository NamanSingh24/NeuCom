import os
import tempfile
import logging
from pathlib import Path
from typing import Optional, Dict, Any, BinaryIO
import requests
import json
import subprocess
import torch
import torchaudio
import numpy as np
from scipy.io.wavfile import write as write_wav
import whisper

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceHandler:
    def __init__(self):
        # Configuration
        self.tts_voice = os.getenv('TTS_VOICE', 'en_default')
        self.stt_model_name = os.getenv('STT_MODEL', 'base')  # tiny, base, small, medium, large
        
        # Supported audio formats
        self.supported_audio_formats = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm', '.ogg']
        self.supported_tts_formats = ['wav', 'mp3']
        
        # Initialize models
        self._initialize_models()
        
        logger.info(f"VoiceHandler initialized with open-source models")
    
    def _initialize_models(self):
        """Initialize TTS and STT models"""
        try:
            # Initialize Whisper for STT
            logger.info(f"Loading Whisper model: {self.stt_model_name}")
            self.whisper_model = whisper.load_model(self.stt_model_name)
            logger.info("✅ Whisper model loaded successfully")
            
            # Initialize OpenVoice TTS (we'll use a simple implementation first)
            self._initialize_tts()
            logger.info("✅ TTS system initialized")
            
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            # Fallback to basic functionality
            self.whisper_model = None
            self.tts_available = False
    
    def _initialize_tts(self):
        """Initialize TTS system"""
        try:
            # Check if espeak is available (fallback TTS)
            result = subprocess.run(['which', 'espeak'], capture_output=True, text=True)
            self.espeak_available = result.returncode == 0
            
            # For now, we'll use espeak as a simple TTS solution
            # Later we can integrate OpenVoice properly
            self.tts_available = self.espeak_available
            
            if self.espeak_available:
                logger.info("✅ eSpeak TTS available")
            else:
                logger.warning("⚠️ eSpeak not found. TTS will be limited.")
                
        except Exception as e:
            logger.error(f"TTS initialization error: {str(e)}")
            self.tts_available = False
    
    def text_to_speech(self, text: str, output_format: str = 'wav', speed: float = 1.0) -> bytes:
        """Convert text to speech using open-source TTS"""
        try:
            if not text.strip():
                raise ValueError("Text cannot be empty")
            
            if output_format not in self.supported_tts_formats:
                logger.warning(f"Unsupported format {output_format}, using wav")
                output_format = 'wav'
            
            if not (0.5 <= speed <= 2.0):
                logger.warning(f"Speed {speed} out of range, using 1.0")
                speed = 1.0
            
            logger.info(f"Converting text to speech: {text[:50]}...")
            
            if self.tts_available and self.espeak_available:
                # Use eSpeak for TTS
                return self._espeak_tts(text, speed, output_format)
            else:
                # Fallback: return empty audio or error
                raise Exception("No TTS engine available")
                
        except Exception as e:
            logger.error(f"Error in text-to-speech conversion: {str(e)}")
            raise Exception(f"TTS conversion failed: {str(e)}")
    
    def _espeak_tts(self, text: str, speed: float, output_format: str) -> bytes:
        """Generate speech using eSpeak"""
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=f'.{output_format}', delete=False) as temp_file:
                temp_path = temp_file.name
            
            # eSpeak command
            speed_words_per_minute = int(175 * speed)  # Default 175 WPM
            cmd = [
                'espeak',
                '-s', str(speed_words_per_minute),
                '-w', temp_path,
                text
            ]
            
            # Run eSpeak
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"eSpeak failed: {result.stderr}")
            
            # Read generated audio
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up
            os.unlink(temp_path)
            
            logger.info(f"Successfully generated {len(audio_data)} bytes of audio")
            return audio_data
            
        except Exception as e:
            logger.error(f"eSpeak TTS error: {str(e)}")
            raise
    
    def speech_to_text(self, 
                       audio_file: BinaryIO, 
                       language: str = None,
                       prompt: str = None,
                       temperature: float = 0.0) -> Dict[str, Any]:
        """Convert speech to text using local Whisper"""
        try:
            if not self.whisper_model:
                raise Exception("Whisper model not available")
                
            if not (0.0 <= temperature <= 1.0):
                logger.warning(f"Temperature {temperature} out of range, using 0.0")
                temperature = 0.0
            
            logger.info("Converting speech to text using local Whisper...")
            
            # Save uploaded audio to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                audio_content = audio_file.read()
                temp_file.write(audio_content)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using Whisper
                result = self.whisper_model.transcribe(
                    temp_file_path,
                    language=language,
                    initial_prompt=prompt,
                    temperature=temperature
                )
                
                # Extract segments for confidence calculation
                segments = result.get('segments', [])
                
                # Calculate confidence (Whisper doesn't provide direct confidence scores)
                confidence = self._calculate_whisper_confidence(segments)
                
                response = {
                    "text": result['text'].strip(),
                    "language": result.get('language', language or 'auto'),
                    "duration": sum(seg.get('end', 0) - seg.get('start', 0) for seg in segments),
                    "segments": segments,
                    "confidence": confidence
                }
                
                logger.info(f"Successfully transcribed audio: {response['text'][:50]}...")
                return response
                
            finally:
                # Clean up temp file
                os.unlink(temp_file_path)
            
        except Exception as e:
            logger.error(f"Error in speech-to-text conversion: {str(e)}")
            raise Exception(f"STT conversion failed: {str(e)}")
    
    def _calculate_whisper_confidence(self, segments: list) -> float:
        """Calculate approximate confidence from Whisper segments"""
        if not segments:
            return 0.5  # Default confidence
        
        # Use average log probability as confidence indicator
        total_confidence = 0.0
        count = 0
        
        for segment in segments:
            if 'avg_logprob' in segment:
                # Convert log probability to confidence (approximate)
                # Whisper's avg_logprob is typically between -1.0 and 0.0
                confidence = max(0.0, min(1.0, segment['avg_logprob'] + 1.0))
                total_confidence += confidence
                count += 1
        
        return total_confidence / count if count > 0 else 0.5
    
    def save_audio_file(self, audio_data: bytes, filename: str, output_dir: str = None) -> str:
        """Save audio data to file"""
        try:
            output_dir = output_dir or tempfile.gettempdir()
            output_path = Path(output_dir) / filename
            
            # Ensure directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'wb') as f:
                f.write(audio_data)
            
            logger.info(f"Audio saved to: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error saving audio file: {str(e)}")
            raise Exception(f"Failed to save audio: {str(e)}")
    
    def load_audio_file(self, file_path: str) -> BinaryIO:
        """Load audio file for processing"""
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                raise FileNotFoundError(f"Audio file not found: {file_path}")
            
            if file_path.suffix.lower() not in self.supported_audio_formats:
                raise ValueError(f"Unsupported audio format: {file_path.suffix}")
            
            # Check file size (100MB limit for local processing)
            max_size = 100 * 1024 * 1024
            if file_path.stat().st_size > max_size:
                raise ValueError("Audio file too large (max 100MB)")
            
            return open(file_path, 'rb')
            
        except Exception as e:
            logger.error(f"Error loading audio file: {str(e)}")
            raise
    
    def validate_audio_file(self, file_path: str) -> Dict[str, Any]:
        """Validate audio file format and properties"""
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                return {"valid": False, "error": "File not found"}
            
            file_size = file_path.stat().st_size
            file_ext = file_path.suffix.lower()
            
            validation_result = {
                "valid": True,
                "filename": file_path.name,
                "file_size_mb": round(file_size / (1024 * 1024), 2),
                "format": file_ext,
                "supported_format": file_ext in self.supported_audio_formats,
                "size_ok": file_size <= 25 * 1024 * 1024,
                "error": None
            }
            
            if not validation_result["supported_format"]:
                validation_result["valid"] = False
                validation_result["error"] = f"Unsupported format: {file_ext}"
            
            if not validation_result["size_ok"]:
                validation_result["valid"] = False
                validation_result["error"] = "File too large (max 25MB)"
            
            return validation_result
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def create_speech_with_ssml(self, ssml_text: str, output_format: str = 'wav') -> bytes:
        """Create speech with SSML markup (basic implementation)"""
        try:
            import re
            
            # Remove SSML tags for basic implementation
            clean_text = re.sub(r'<[^>]+>', '', ssml_text)
            
            # Extract any speed modifications from SSML
            speed = 1.0
            speed_match = re.search(r'rate="([^"]*)"', ssml_text)
            if speed_match:
                rate_value = speed_match.group(1)
                if 'slow' in rate_value:
                    speed = 0.8
                elif 'fast' in rate_value:
                    speed = 1.2
            
            return self.text_to_speech(clean_text, output_format, speed)
            
        except Exception as e:
            logger.error(f"Error creating speech with SSML: {str(e)}")
            raise
    
    def get_available_voices(self) -> list:
        """Get list of available TTS voices for eSpeak"""
        if not self.espeak_available:
            return []
            
        try:
            # Get available eSpeak voices
            result = subprocess.run(['espeak', '--voices'], capture_output=True, text=True)
            voices = []
            
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')[1:]  # Skip header
                for line in lines:
                    parts = line.split()
                    if len(parts) >= 2:
                        lang_code = parts[1]
                        name = parts[3] if len(parts) > 3 else lang_code
                        voices.append({
                            "id": lang_code,
                            "name": name,
                            "description": f"eSpeak voice: {name}"
                        })
            
            # If no voices found, return default
            if not voices:
                voices = [
                    {
                        "id": "en",
                        "name": "English",
                        "description": "Default English voice"
                    }
                ]
            
            return voices[:10]  # Limit to first 10 voices
            
        except Exception as e:
            logger.error(f"Error getting available voices: {str(e)}")
            return [
                {
                    "id": "en",
                    "name": "English", 
                    "description": "Default English voice"
                }
            ]
    def change_voice(self, voice_id: str) -> bool:
        """Change the TTS voice"""
        try:
            available_voices = [v["id"] for v in self.get_available_voices()]
            
            if voice_id not in available_voices:
                logger.error(f"Invalid voice ID: {voice_id}")
                return False
            
            self.tts_voice = voice_id
            logger.info(f"Changed TTS voice to: {voice_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error changing voice: {str(e)}")
            return False
    
    def get_voice_info(self) -> Dict[str, Any]:
        """Get current voice configuration"""
        return {
            "tts_system": "eSpeak" if self.espeak_available else "None",
            "current_voice": self.tts_voice,
            "stt_model": self.stt_model_name,
            "whisper_available": self.whisper_model is not None,
            "supported_audio_formats": self.supported_audio_formats,
            "supported_tts_formats": self.supported_tts_formats,
            "available_voices": self.get_available_voices()
        }
    
    def process_audio_stream(self, audio_stream, chunk_size: int = 1024) -> Dict[str, Any]:
        """Process audio stream for real-time transcription"""
        try:
            if not self.whisper_model:
                raise Exception("Whisper model not available")
                
            # Collect audio data
            audio_data = b""
            for chunk in audio_stream:
                audio_data += chunk
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Process the audio file
                with open(temp_file_path, 'rb') as audio_file:
                    result = self.speech_to_text(audio_file)
                return result
            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)
                
        except Exception as e:
            logger.error(f"Error processing audio stream: {str(e)}")
            raise
    
    def install_dependencies(self) -> Dict[str, bool]:
        """Check and install required dependencies"""
        status = {
            "whisper": False,
            "espeak": False,
            "torch": False
        }
        
        try:
            # Check Whisper
            import whisper
            status["whisper"] = True
        except ImportError:
            logger.warning("Whisper not installed. Install with: pip install openai-whisper")
        
        try:
            # Check PyTorch
            import torch
            status["torch"] = True
        except ImportError:
            logger.warning("PyTorch not installed. Install with: pip install torch")
        
        try:
            # Check eSpeak
            result = subprocess.run(['which', 'espeak'], capture_output=True)
            status["espeak"] = result.returncode == 0
            if not status["espeak"]:
                logger.warning("eSpeak not installed. Install with: sudo apt-get install espeak (Linux) or brew install espeak (macOS)")
        except:
            logger.warning("Could not check eSpeak installation")
        
        return status
