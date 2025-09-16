"""
Test script for Live SOP Interpreter
Run this to test all components
"""

import os
import sys
import asyncio
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

async def test_components():
    """Test all components"""
    print("🧪 Testing Live SOP Interpreter Components...")
    
    # Test 1: Environment Variables
    print("\n1. Testing Environment Variables...")
    from dotenv import load_dotenv
    load_dotenv()
    
    groq_key = os.getenv('GROQ_API_KEY')
    openai_key = os.getenv('OPENAI_API_KEY')
    
    print(f"   GROQ_API_KEY: {'Set' if groq_key else ' Missing'}")
    print(f"   OPENAI_API_KEY: {'Set' if openai_key else 'Missing'}")
    
    # Test 2: Document Processor
    print("\n2. Testing Document Processor...")
    try:
        from document_processor import DocumentProcessor
        doc_processor = DocumentProcessor()
        print("   ✅ Document Processor initialized")
    except Exception as e:
        print(f"   ❌ Document Processor failed: {e}")
        return
    
    # Test 3: RAG Engine
    print("\n3. Testing RAG Engine...")
    try:
        from rag_engine import RAGEngine
        rag_engine = RAGEngine()
        stats = rag_engine.get_collection_stats()
        print(f"   ✅ RAG Engine initialized")
        print(f"   📊 Documents in DB: {stats.get('total_documents', 0)}")
    except Exception as e:
        print(f"   ❌ RAG Engine failed: {e}")
        return
    
    # Test 4: Groq Client
    print("\n4. Testing Groq Client...")
    try:
        from groq_client import GroqClient
        if groq_key:
            groq_client = GroqClient()
            model_info = groq_client.get_model_info()
            print(f"   ✅ Groq Client initialized")
            print(f"   🤖 Model: {model_info['model']}")
        else:
            print("   ⚠️ Groq Client skipped (no API key)")
    except Exception as e:
        print(f"   ❌ Groq Client failed: {e}")
    
    # Test 5: Voice Handler
    print("\n5. Testing Voice Handler...")
    try:
        from voice_handler import VoiceHandler
        if openai_key:
            voice_handler = VoiceHandler()
            voice_info = voice_handler.get_voice_info()
            print(f"   ✅ Voice Handler initialized")
            print(f"   🗣️ Current voice: {voice_info['current_voice']}")
            print(f"   📱 Available voices: {len(voice_info['available_voices'])}")
        else:
            print("   ⚠️ Voice Handler skipped (no OpenAI API key)")
    except Exception as e:
        print(f"   ❌ Voice Handler failed: {e}")
        voice_handler = None
    
    # Test 6: SOP Chat
    print("\n6. Testing SOP Chat...")
    try:
        from sop_chat import SOPChat
        if groq_key:
            sop_chat = SOPChat(rag_engine, groq_client, voice_handler)
            print("   ✅ SOP Chat initialized")
            
            # Test a simple query
            test_query = "Hello, can you help me?"
            response = sop_chat.process_query(test_query)
            print(f"   💬 Test query response: {response['response'][:50]}...")
        else:
            print("   ⚠️ SOP Chat skipped (no Groq API key)")
    except Exception as e:
        print(f"   ❌ SOP Chat failed: {e}")
    
    # Test 7: FastAPI App
    print("\n7. Testing FastAPI App...")
    try:
        from main import app
        print("   ✅ FastAPI app imported successfully")
        print("   🌐 Ready to start server with: python main.py")
    except Exception as e:
        print(f"   ❌ FastAPI app failed: {e}")
    
    print("\n" + "="*50)
    print("🎉 Component Testing Complete!")
    print("\n📋 Next Steps:")
    print("1. Add missing API keys to .env file")
    print("2. Start the server: python main.py")
    print("3. Upload SOP documents via /upload endpoint")
    print("4. Test the API at http://localhost:8000/docs")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(test_components())
