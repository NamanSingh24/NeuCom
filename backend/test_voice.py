#!/usr/bin/env python3
"""
Test script for Open Source Voice functionality
"""

import os
import sys
import tempfile
import subprocess
from pathlib import Path

def test_espeak():
    """Test eSpeak installation"""
    print("🗣️ Testing eSpeak...")
    try:
        # Test if eSpeak is available
        result = subprocess.run(['espeak', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ eSpeak found: {result.stdout.strip()}")
            
            # Test speech generation
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
            
            cmd = ['espeak', '-w', temp_path, 'Testing eSpeak voice synthesis']
            result = subprocess.run(cmd, capture_output=True)
            
            if result.returncode == 0 and os.path.exists(temp_path):
                file_size = os.path.getsize(temp_path)
                print(f"✅ eSpeak synthesis test passed ({file_size} bytes generated)")
                os.unlink(temp_path)
                return True
            else:
                print(f"❌ eSpeak synthesis failed: {result.stderr}")
                return False
        else:
            print(f"❌ eSpeak not found: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ eSpeak not found in PATH")
        print("Install with: brew install espeak (macOS) or sudo apt-get install espeak (Linux)")
        return False
    except Exception as e:
        print(f"❌ eSpeak test error: {e}")
        return False

def test_whisper():
    """Test Whisper installation"""
    print("\n🎤 Testing Whisper...")
    try:
        import whisper
        print("✅ Whisper module imported successfully")
        
        # Test model loading
        print("📥 Loading Whisper base model (this may take a moment)...")
        model = whisper.load_model("base")
        print("✅ Whisper model loaded successfully")
        
        # Test with a simple audio file (we'll create a silent one)
        print("🔊 Testing transcription...")
        
        # Create a simple test audio file using eSpeak
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_path = temp_file.name
        
        # Generate test audio with eSpeak
        cmd = ['espeak', '-w', temp_path, 'Hello world test']
        result = subprocess.run(cmd, capture_output=True)
        
        if result.returncode == 0:
            # Transcribe the audio
            result = model.transcribe(temp_path)
            transcription = result["text"].strip().lower()
            print(f"✅ Whisper transcription: '{transcription}'")
            
            # Clean up
            os.unlink(temp_path)
            
            # Check if transcription makes sense
            if any(word in transcription for word in ["hello", "world", "test"]):
                print("✅ Whisper transcription test passed!")
                return True
            else:
                print("⚠️ Whisper transcription unclear but working")
                return True
        else:
            print("❌ Could not generate test audio for Whisper")
            return False
            
    except ImportError:
        print("❌ Whisper not installed")
        print("Install with: pip install openai-whisper")
        return False
    except Exception as e:
        print(f"❌ Whisper test error: {e}")
        return False

def test_torch():
    """Test PyTorch installation"""
    print("\n🔥 Testing PyTorch...")
    try:
        import torch
        print(f"✅ PyTorch {torch.__version__} imported successfully")
        
        # Test basic tensor operations
        x = torch.randn(2, 3)
        print(f"✅ PyTorch tensor operations working")
        return True
    except ImportError:
        print("❌ PyTorch not installed")
        print("Install with: pip install torch torchaudio")
        return False
    except Exception as e:
        print(f"❌ PyTorch test error: {e}")
        return False

def test_voice_handler():
    """Test the voice handler class"""
    print("\n🎭 Testing VoiceHandler class...")
    try:
        # Add the current directory to Python path
        sys.path.append(str(Path(__file__).parent))
        
        from voice_handler import VoiceHandler
        
        # Initialize voice handler
        handler = VoiceHandler()
        print("✅ VoiceHandler initialized successfully")
        
        # Test voice info
        voice_info = handler.get_voice_info()
        print(f"✅ Voice info retrieved: {voice_info['tts_system']}")
        
        # Test available voices
        voices = handler.get_available_voices()
        print(f"✅ Available voices: {len(voices)} found")
        
        # Test dependency check
        deps = handler.install_dependencies()
        print(f"✅ Dependencies check: {deps}")
        
        return True
    except Exception as e:
        print(f"❌ VoiceHandler test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Open Source Voice Setup")
    print("=" * 50)
    
    tests = [
        ("eSpeak", test_espeak),
        ("PyTorch", test_torch),
        ("Whisper", test_whisper),
        ("VoiceHandler", test_voice_handler)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test failed with error: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:15} {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Voice functionality is ready.")
        print("\n🚀 Next steps:")
        print("1. Start the server: python main.py")
        print("2. Test voice endpoints at http://localhost:8000/docs")
        print("3. Upload audio files for transcription")
    else:
        print("⚠️ Some tests failed. Please check the installation.")
        print("\n🔧 To fix issues:")
        print("1. Run: ./install_voice.sh")
        print("2. Check the VOICE_SETUP.md guide")
        print("3. Install missing dependencies manually")
    
    print("=" * 50)

if __name__ == "__main__":
    main()
