import os
import re
import tempfile
import logging
from pathlib import Path
from typing import Optional, Dict, Any, BinaryIO, List
import subprocess

import whisper

# Optional dependencies used by other parts of the project. They are not
# required for the eSpeak pipeline, so we swallow import errors gracefully.
try:  # pragma: no cover - optional dependencies
    import torch  # noqa: F401
    import torchaudio  # noqa: F401
    import numpy as np  # noqa: F401
    from scipy.io.wavfile import write as write_wav  # noqa: F401
except Exception:  # pragma: no cover - ignore missing optional deps
    pass

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Friendly presets that map product voice labels to concrete eSpeak voices so
# the UI can present human-readable options.
VOICE_PRESETS: Dict[str, Dict[str, str]] = {
    "nova": {
        "engine_voice": "en-us",
        "name": "Nova (Warm US)",
        "description": "Balanced North American English with a warmer delivery",
    },
    "alloy": {
        "engine_voice": "en-gb",
        "name": "Alloy (Bright UK)",
        "description": "Crisp British English with a professional tone",
    },
    "echo": {
        "engine_voice": "en-uk-rp",
        "name": "Echo (RP)",
        "description": "Received Pronunciation for precise instructional delivery",
    },
    "fable": {
        "engine_voice": "en-uk-wmids",
        "name": "Fable (Midlands)",
        "description": "Engaging UK Midlands accent for step-by-step narration",
    },
    "onyx": {
        "engine_voice": "en-sc",
        "name": "Onyx (Scottish)",
        "description": "Deeper Scottish tone suited to confident briefings",
    },
    "shimmer": {
        "engine_voice": "en-wi",
        "name": "Shimmer (Caribbean)",
        "description": "Upbeat Caribbean English with energetic cadence",
    },
}

DEFAULT_FRIENDLY_VOICE = "nova"


class VoiceHandler:
    def __init__(self):
        # Configuration
        self.voice_presets = VOICE_PRESETS
        preferred_voice = os.getenv("TTS_VOICE", DEFAULT_FRIENDLY_VOICE)
        self.tts_voice = preferred_voice.lower() if preferred_voice else DEFAULT_FRIENDLY_VOICE
        self.stt_model_name = os.getenv("STT_MODEL", "base")  # tiny, base, small, medium, large

        # Supported audio formats
        self.supported_audio_formats = [
            ".mp3",
            ".mp4",
            ".mpeg",
            ".mpga",
            ".m4a",
            ".wav",
            ".webm",
            ".ogg",
        ]
        self.supported_tts_formats = ["wav", "mp3"]

        # Runtime flags
        self.espeak_available = False
        self.tts_available = False
        self.whisper_model = None
        self._espeak_voice_catalog: Dict[str, Dict[str, str]] = {}

        # Initialize models
        self._initialize_models()

        logger.info("VoiceHandler initialized with open-source models")

    # ------------------------------------------------------------------
    # Initialisation helpers
    # ------------------------------------------------------------------

    def _initialize_models(self):
        """Initialize TTS and STT models"""
        try:
            logger.info(f"Loading Whisper model: {self.stt_model_name}")
            self.whisper_model = whisper.load_model(self.stt_model_name)
            logger.info("✅ Whisper model loaded successfully")

            self._initialize_tts()
            logger.info("✅ TTS system initialized")
            self._validate_current_voice()
        except Exception as exc:
            logger.error(f"Error initializing models: {exc}")
            self.whisper_model = None
            self.tts_available = False

    def _initialize_tts(self):
        """Detect and prepare the local TTS engine"""
        try:
            result = subprocess.run(["which", "espeak"], capture_output=True, text=True)
            self.espeak_available = result.returncode == 0
            self.tts_available = self.espeak_available

            if self.espeak_available:
                self._espeak_voice_catalog = self._load_espeak_voice_catalog()
                logger.info("✅ eSpeak TTS available")
            else:
                logger.warning("⚠️ eSpeak not found. TTS will be limited.")
        except Exception as exc:
            logger.error(f"TTS initialization error: {exc}")
            self.tts_available = False

    # ------------------------------------------------------------------
    # Text-to-speech
    # ------------------------------------------------------------------

    def text_to_speech(
        self,
        text: str,
        voice: Optional[str] = None,
        output_format: str = "wav",
        speed: float = 1.0,
    ) -> bytes:
        """Convert text to speech using the configured TTS engine"""
        try:
            if not text.strip():
                raise ValueError("Text cannot be empty")

            if output_format not in self.supported_tts_formats:
                logger.warning(f"Unsupported format {output_format}, using wav")
                output_format = "wav"

            if not (0.5 <= speed <= 2.0):
                logger.warning(f"Speed {speed} out of range, using 1.0")
                speed = 1.0

            requested_voice = (voice or self.tts_voice or DEFAULT_FRIENDLY_VOICE).lower()
            engine_voice = self._resolve_engine_voice(requested_voice)
            if not engine_voice:
                raise Exception(f"Requested voice '{requested_voice}' is not available")

            # Persist the friendly voice label for future calls
            self.tts_voice = requested_voice

            logger.info(
                "Converting text to speech using voice '%s' -> engine '%s': %s...",
                requested_voice,
                engine_voice,
                text[:50],
            )

            if self.tts_available and self.espeak_available:
                return self._espeak_tts(text, speed, output_format, engine_voice)

            raise Exception("No TTS engine available")
        except Exception as exc:
            logger.error(f"Error in text-to-speech conversion: {exc}")
            raise Exception(f"TTS conversion failed: {exc}")

    def _espeak_tts(self, text: str, speed: float, output_format: str, engine_voice: str) -> bytes:
        """Generate speech using eSpeak"""
        try:
            with tempfile.NamedTemporaryFile(suffix=f".{output_format}", delete=False) as tmp_file:
                temp_path = tmp_file.name

            speed_words_per_minute = int(175 * speed)
            cmd = [
                "espeak",
                "-v",
                engine_voice,
                "-s",
                str(speed_words_per_minute),
                "-w",
                temp_path,
                text,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"eSpeak failed: {result.stderr}")

            with open(temp_path, "rb") as handle:
                audio_data = handle.read()

            os.unlink(temp_path)
            logger.info(
                "Successfully generated %s bytes of audio with engine voice '%s'",
                len(audio_data),
                engine_voice,
            )
            return audio_data
        except Exception as exc:
            logger.error(f"eSpeak TTS error: {exc}")
            raise

    # ------------------------------------------------------------------
    # Speech-to-text
    # ------------------------------------------------------------------

    def speech_to_text(
        self,
        audio_file: BinaryIO,
        language: str = None,
        prompt: str = None,
        temperature: float = 0.0,
    ) -> Dict[str, Any]:
        """Convert speech to text using local Whisper"""
        try:
            if not self.whisper_model:
                raise Exception("Whisper model not available")

            if not (0.0 <= temperature <= 1.0):
                logger.warning(f"Temperature {temperature} out of range, using 0.0")
                temperature = 0.0

            logger.info("Converting speech to text using local Whisper...")

            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_file:
                audio_content = audio_file.read()
                tmp_file.write(audio_content)
                temp_file_path = tmp_file.name

            try:
                result = self.whisper_model.transcribe(
                    temp_file_path,
                    language=language,
                    initial_prompt=prompt,
                    temperature=temperature,
                )

                segments = result.get("segments", [])
                confidence = self._calculate_whisper_confidence(segments)

                response = {
                    "text": result["text"].strip(),
                    "language": result.get("language", language or "auto"),
                    "duration": sum(seg.get("end", 0) - seg.get("start", 0) for seg in segments),
                    "segments": segments,
                    "confidence": confidence,
                }

                logger.info("Successfully transcribed audio: %s...", response["text"][:50])
                return response
            finally:
                os.unlink(temp_file_path)
        except Exception as exc:
            logger.error(f"Error in speech-to-text conversion: {exc}")
            raise Exception(f"STT conversion failed: {exc}")

    def _calculate_whisper_confidence(self, segments: List[Dict[str, Any]]) -> float:
        if not segments:
            return 0.5

        total_confidence = 0.0
        count = 0
        for segment in segments:
            if "avg_logprob" in segment:
                confidence = max(0.0, min(1.0, segment["avg_logprob"] + 1.0))
                total_confidence += confidence
                count += 1

        return total_confidence / count if count else 0.5

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    def save_audio_file(self, audio_data: bytes, filename: str, output_dir: str = None) -> str:
        try:
            output_dir = output_dir or tempfile.gettempdir()
            output_path = Path(output_dir) / filename
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as handle:
                handle.write(audio_data)

            logger.info(f"Audio saved to: {output_path}")
            return str(output_path)
        except Exception as exc:
            logger.error(f"Error saving audio file: {exc}")
            raise Exception(f"Failed to save audio: {exc}")

    def load_audio_file(self, file_path: str) -> BinaryIO:
        try:
            path = Path(file_path)
            if not path.exists():
                raise FileNotFoundError(f"Audio file not found: {path}")

            if path.suffix.lower() not in self.supported_audio_formats:
                raise ValueError(f"Unsupported audio format: {path.suffix}")

            max_size = 100 * 1024 * 1024
            if path.stat().st_size > max_size:
                raise ValueError("Audio file too large (max 100MB)")

            return open(path, "rb")
        except Exception as exc:
            logger.error(f"Error loading audio file: {exc}")
            raise

    def validate_audio_file(self, file_path: str) -> Dict[str, Any]:
        try:
            path = Path(file_path)
            if not path.exists():
                return {"valid": False, "error": "File not found"}

            file_size = path.stat().st_size
            file_ext = path.suffix.lower()

            validation_result = {
                "valid": True,
                "filename": path.name,
                "file_size_mb": round(file_size / (1024 * 1024), 2),
                "format": file_ext,
                "supported_format": file_ext in self.supported_audio_formats,
                "size_ok": file_size <= 25 * 1024 * 1024,
                "error": None,
            }

            if not validation_result["supported_format"]:
                validation_result["valid"] = False
                validation_result["error"] = f"Unsupported format: {file_ext}"

            if not validation_result["size_ok"]:
                validation_result["valid"] = False
                validation_result["error"] = "File too large (max 25MB)"

            return validation_result
        except Exception as exc:
            return {"valid": False, "error": str(exc)}

    def create_speech_with_ssml(self, ssml_text: str, output_format: str = "wav") -> bytes:
        try:
            clean_text = re.sub(r"<[^>]+>", "", ssml_text)

            speed = 1.0
            speed_match = re.search(r'rate="([^"]*)"', ssml_text)
            if speed_match:
                rate_value = speed_match.group(1)
                if "slow" in rate_value:
                    speed = 0.8
                elif "fast" in rate_value:
                    speed = 1.2

            return self.text_to_speech(clean_text, speed=speed, output_format=output_format)
        except Exception as exc:
            logger.error(f"Error creating speech with SSML: {exc}")
            raise

    # ------------------------------------------------------------------
    # Voice catalog and info helpers
    # ------------------------------------------------------------------

    def get_available_voices(self) -> List[Dict[str, str]]:
        voices: List[Dict[str, str]] = []

        if self.espeak_available:
            used_engine_voices = set()
            for preset_id, preset in self.voice_presets.items():
                engine_voice = preset.get("engine_voice")
                if not engine_voice or not self._engine_has_voice(engine_voice):
                    continue
                voices.append(
                    {
                        "id": preset_id,
                        "name": preset.get("name", preset_id.title()),
                        "description": preset.get(
                            "description", f"eSpeak voice {engine_voice}"
                        ),
                        "engine_voice": engine_voice,
                    }
                )
                used_engine_voices.add(engine_voice)

            for engine_voice, info in self._espeak_voice_catalog.items():
                if engine_voice in used_engine_voices:
                    continue
                voices.append(
                    {
                        "id": engine_voice,
                        "name": f"{info['name']} ({engine_voice})",
                        "description": f"eSpeak voice {engine_voice}",
                        "engine_voice": engine_voice,
                    }
                )

        if not voices:
            voices = [
                {
                    "id": DEFAULT_FRIENDLY_VOICE,
                    "name": self.voice_presets[DEFAULT_FRIENDLY_VOICE]["name"],
                    "description": self.voice_presets[DEFAULT_FRIENDLY_VOICE]["description"],
                    "engine_voice": self.voice_presets[DEFAULT_FRIENDLY_VOICE]["engine_voice"],
                }
            ]

        return voices

    def change_voice(self, voice_id: str) -> bool:
        try:
            if not voice_id:
                logger.error("Voice ID cannot be empty")
                return False

            normalized_id = voice_id.strip().lower()
            engine_voice = self._resolve_engine_voice(normalized_id)
            if not engine_voice:
                logger.error(f"Invalid voice ID: {voice_id}")
                return False

            self.tts_voice = normalized_id
            logger.info(
                "Changed TTS voice to: %s (engine: %s)", normalized_id, engine_voice
            )
            return True
        except Exception as exc:
            logger.error(f"Error changing voice: {exc}")
            return False

    def get_voice_info(self) -> Dict[str, Any]:
        engine_voice = self._resolve_engine_voice(self.tts_voice)
        preset = self.voice_presets.get(self.tts_voice)
        current_name = (
            preset["name"]
            if preset
            else self._espeak_voice_catalog.get(engine_voice or "", {}).get(
                "name", self.tts_voice
            )
        )

        return {
            "tts_system": "eSpeak" if self.espeak_available else "None",
            "current_voice": self.tts_voice,
            "current_voice_name": current_name,
            "engine_voice": engine_voice,
            "stt_model": self.stt_model_name,
            "whisper_available": self.whisper_model is not None,
            "supported_audio_formats": self.supported_audio_formats,
            "supported_tts_formats": self.supported_tts_formats,
            "available_voices": self.get_available_voices(),
        }

    # ------------------------------------------------------------------
    # Streaming helpers
    # ------------------------------------------------------------------

    def process_audio_stream(self, audio_stream, chunk_size: int = 1024) -> Dict[str, Any]:
        try:
            if not self.whisper_model:
                raise Exception("Whisper model not available")

            audio_data = b""
            for chunk in audio_stream:
                audio_data += chunk

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_file.write(audio_data)
                temp_file_path = tmp_file.name

            try:
                with open(temp_file_path, "rb") as audio_file:
                    result = self.speech_to_text(audio_file)
                return result
            finally:
                os.unlink(temp_file_path)
        except Exception as exc:
            logger.error(f"Error processing audio stream: {exc}")
            raise

    # ------------------------------------------------------------------
    # Installation helpers
    # ------------------------------------------------------------------

    def install_dependencies(self) -> Dict[str, bool]:
        status = {"whisper": False, "espeak": False, "torch": False}

        try:
            import whisper  # noqa: F401

            status["whisper"] = True
        except ImportError:
            logger.warning("Whisper not installed. Install with: pip install openai-whisper")

        try:
            import torch  # noqa: F401

            status["torch"] = True
        except ImportError:
            logger.warning("PyTorch not installed. Install with: pip install torch")

        try:
            result = subprocess.run(["which", "espeak"], capture_output=True)
            status["espeak"] = result.returncode == 0
            if not status["espeak"]:
                logger.warning(
                    "eSpeak not installed. Install with: sudo apt-get install espeak"
                )
        except Exception:
            logger.warning("Could not check eSpeak installation")

        return status

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_espeak_voice_catalog(self) -> Dict[str, Dict[str, str]]:
        voices: Dict[str, Dict[str, str]] = {}

        try:
            result = subprocess.run(
                ["espeak", "--voices"],
                capture_output=True,
                text=True,
                check=True,
            )
            lines = result.stdout.strip().split("\n")
            for line in lines[1:]:
                parts = line.split()
                if len(parts) < 4:
                    continue
                lang_code = parts[1].lower()
                gender = parts[2]
                voice_name = parts[3].replace("_", " ")

                if lang_code not in voices:
                    voices[lang_code] = {
                        "id": lang_code,
                        "language": lang_code,
                        "gender": gender,
                        "name": voice_name.title(),
                    }
        except subprocess.CalledProcessError as err:
            logger.error(f"Failed to query eSpeak voices: {err.stderr}")
        except FileNotFoundError:
            logger.error("eSpeak executable not found while loading voices")
        except Exception as exc:
            logger.error(f"Unexpected error loading eSpeak voices: {exc}")

        return voices

    def _engine_has_voice(self, engine_voice: Optional[str]) -> bool:
        if not engine_voice or not self.espeak_available:
            return False

        engine_voice = engine_voice.lower()
        if engine_voice in self._espeak_voice_catalog:
            return True

        return engine_voice in {"en", "default"}

    def _resolve_engine_voice(self, voice_id: Optional[str]) -> Optional[str]:
        if not voice_id:
            return None

        voice_id = voice_id.lower()
        preset = self.voice_presets.get(voice_id)
        if preset:
            engine_voice = preset.get("engine_voice")
            if self._engine_has_voice(engine_voice):
                return engine_voice
            logger.warning(
                "Preset voice '%s' maps to '%s', which is unavailable on this system",
                voice_id,
                engine_voice,
            )

        if self._engine_has_voice(voice_id):
            return voice_id

        logger.warning(f"Voice '{voice_id}' not available; falling back to default")
        return self._fallback_engine_voice()

    def _fallback_engine_voice(self) -> Optional[str]:
        default_engine = self.voice_presets[DEFAULT_FRIENDLY_VOICE]["engine_voice"]
        if self._engine_has_voice(default_engine):
            return default_engine
        if self._engine_has_voice("en-us"):
            return "en-us"
        if self._engine_has_voice("en"):
            return "en"
        if self._espeak_voice_catalog:
            return next(iter(self._espeak_voice_catalog.keys()))
        return None

    def _validate_current_voice(self):
        if not self.espeak_available:
            return

        engine_voice = self._resolve_engine_voice(self.tts_voice)
        if not engine_voice:
            logger.warning(
                "Configured voice '%s' is unavailable; defaulting to '%s'",
                self.tts_voice,
                DEFAULT_FRIENDLY_VOICE,
            )
            self.tts_voice = DEFAULT_FRIENDLY_VOICE
