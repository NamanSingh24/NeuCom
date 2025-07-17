# 🛠️ Live SOP Interpreter - RAG Implementation Guide

## 📋 Project Overview
A voice-interactive SOP interpreter that uses RAG (Retrieval Augmented Generation) with Groq API for intelligent document processing and natural conversation.

## 🎯 Features
- **Document Upload**: Accept PDF, DOCX, MD files
- **RAG Implementation**: Vector embeddings for document retrieval
- **Voice/Text Chat**: Interactive conversation about SOP procedures
- **Groq API Integration**: Fast inference with open-source models
- **WhatsApp Ready**: Structured for easy WhatsApp integration

---

## 🔧 Tech Stack

### Core Components
- **Document Processing**: `PyPDF2`, `python-docx`, `markdown`
- **Vector Database**: `chromadb` (lightweight, embedded)
- **Embeddings**: `sentence-transformers` (open-source)
- **LLM API**: `groq` (fast inference)
- **Voice I/O**: `speech_recognition`, `pyttsx3`
- **Web Framework**: `fastapi` (async support)

---

## 🚀 Implementation Steps

### Step 1: Project Setup
```bash
# Create project
mkdir live-sop-interpreter
cd live-sop-interpreter

# Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Dependencies (`requirements.txt`)
```txt
# Core
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6

# Document Processing
PyPDF2==3.0.1
python-docx==0.8.11
markdown==3.5.1

# RAG Components
chromadb==0.4.15
sentence-transformers==2.2.2
langchain==0.0.335
langchain-community==0.0.38

# LLM API
groq==0.4.1

# Voice Processing
SpeechRecognition==3.10.0
pyttsx3==2.90
pyaudio==0.2.11

# Utilities
python-dotenv==1.0.0
pydantic==2.5.0
```

### Step 3: Project Structure
```
live-sop-interpreter/
├── main.py                 # FastAPI app
├── document_processor.py   # Document parsing & chunking
├── rag_engine.py          # RAG implementation
├── voice_handler.py       # Voice I/O
├── groq_client.py         # Groq API client
├── sop_chat.py           # Chat logic
├── .env                  # Environment variables
├── requirements.txt      # Dependencies
├── uploads/              # Document uploads
└── vector_db/           # ChromaDB storage
```

---

## 💻 Core Implementation

### 1. Environment Setup (`.env`)
```env
GROQ_API_KEY=your_groq_api_key_here
VECTOR_DB_PATH=./vector_db
UPLOAD_DIR=./uploads
```

### 2. Document Processor (`document_processor.py`)
```python
import os
from pathlib import Path
import PyPDF2
from docx import Document
import markdown
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict

class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
    
    def process_document(self, file_path: str) -> List[Dict]:
        """Process document and return chunks with metadata"""
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.pdf':
            text = self._extract_pdf(file_path)
        elif file_ext == '.docx':
            text = self._extract_docx(file_path)
        elif file_ext == '.md':
            text = self._extract_markdown(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Split into chunks
        chunks = self.text_splitter.split_text(text)
        
        # Add metadata
        doc_chunks = []
        for i, chunk in enumerate(chunks):
            doc_chunks.append({
                'text': chunk,
                'chunk_id': i,
                'source': Path(file_path).name,
                'file_type': file_ext,
                'steps': self._extract_steps(chunk)
            })
        
        return doc_chunks
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    def _extract_markdown(self, file_path: str) -> str:
        """Extract text from Markdown"""
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        return content
    
    def _extract_steps(self, text: str) -> List[str]:
        """Extract step-by-step instructions"""
        import re
        steps = re.findall(r'(?:^|\n)(\d+\.\s+.*?)(?=\n\d+\.|\n\n|\Z)', text, re.MULTILINE)
        return [step.strip() for step in steps]
```

### 3. RAG Engine (`rag_engine.py`)
```python
import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import os
from pathlib import Path

class RAGEngine:
    def __init__(self, db_path: str = "./vector_db"):
        self.db_path = db_path
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="sop_documents",
            metadata={"hnsw:space": "cosine"}
        )
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def add_documents(self, documents: List[Dict]) -> None:
        """Add documents to vector database"""
        texts = [doc['text'] for doc in documents]
        embeddings = self.embedding_model.encode(texts).tolist()
        
        ids = [f"{doc['source']}_{doc['chunk_id']}" for doc in documents]
        metadatas = [
            {
                'source': doc['source'],
                'chunk_id': doc['chunk_id'],
                'file_type': doc['file_type'],
                'steps_count': len(doc['steps'])
            }
            for doc in documents
        ]
        
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
    
    def search_documents(self, query: str, n_results: int = 3) -> List[Dict]:
        """Search for relevant documents"""
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results,
            include=['documents', 'metadatas', 'distances']
        )
        
        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                'text': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'relevance_score': 1 - results['distances'][0][i]
            })
        
        return formatted_results
    
    def get_collection_stats(self) -> Dict:
        """Get collection statistics"""
        return {
            'total_documents': self.collection.count(),
            'collection_name': self.collection.name
        }
```

### 4. Groq Client (`groq_client.py`)
```python
from groq import Groq
import os
from typing import List, Dict, Optional

class GroqClient:
    def __init__(self, api_key: str = None):
        self.client = Groq(api_key=api_key or os.getenv('GROQ_API_KEY'))
        self.model = "llama3-8b-8192"  # Fast, good for SOPs
    
    def generate_response(self, 
                         query: str, 
                         context: List[Dict], 
                         conversation_history: List[Dict] = None) -> str:
        """Generate response using RAG context"""
        
        # Build context from retrieved documents
        context_text = "\n\n".join([
            f"Document: {doc['metadata']['source']}\n{doc['text']}"
            for doc in context
        ])
        
        # Build conversation history
        messages = [
            {
                "role": "system",
                "content": self._get_system_prompt()
            }
        ]
        
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current query with context
        messages.append({
            "role": "user",
            "content": f"""
Context from SOP documents:
{context_text}

User Query: {query}

Please provide a helpful response based on the SOP context. If the query is about a specific step, explain it clearly and mention any safety considerations.
"""
        })
        
        try:
            response = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.3,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for SOP assistant"""
        return """You are a helpful SOP (Standard Operating Procedure) assistant. Your role is to:

1. Help users understand and follow SOP procedures step by step
2. Provide clear, safety-focused explanations
3. Answer questions about specific steps or procedures
4. Maintain a professional but friendly tone
5. Always prioritize safety and accuracy

Guidelines:
- Use the provided context to answer questions
- If asked about a step, explain it clearly and mention timing if relevant
- Highlight any safety considerations
- If information is not in the context, say so clearly
- Keep responses concise but comprehensive
- Use bullet points for multi-step explanations"""

    def extract_intent(self, query: str) -> Dict[str, str]:
        """Extract intent from user query"""
        intent_prompt = f"""
Analyze this user query and determine the intent:
Query: "{query}"

Return the intent as one of:
- step_question: asking about a specific step
- procedure_overview: wants overview of procedure
- safety_question: asking about safety
- navigation: wants to go to next/previous step
- clarification: needs clarification on something
- general: general question

Intent:"""
        
        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": intent_prompt}],
                model=self.model,
                temperature=0.1,
                max_tokens=50
            )
            
            intent = response.choices[0].message.content.strip().lower()
            return {"intent": intent, "confidence": 0.8}
        except:
            return {"intent": "general", "confidence": 0.5}
```

### 5. Voice Handler (`voice_handler.py`)
```python
import speech_recognition as sr
import pyttsx3
import threading
import queue
import time

class VoiceHandler:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = pyttsx3.init()
        self.is_listening = False
        
        # Configure TTS
        self._configure_tts()
    
    def _configure_tts(self):
        """Configure text-to-speech"""
        voices = self.tts_engine.getProperty('voices')
        if voices:
            # Use female voice if available
            for voice in voices:
                if 'female' in voice.name.lower():
                    self.tts_engine.setProperty('voice', voice.id)
                    break
        
        self.tts_engine.setProperty('rate', 150)
        self.tts_engine.setProperty('volume', 0.9)
    
    def speak(self, text: str):
        """Convert text to speech"""
        print(f"🔊 Speaking: {text}")
        self.tts_engine.say(text)
        self.tts_engine.runAndWait()
    
    def listen(self, timeout: int = 5) -> str:
        """Listen for voice input"""
        try:
            with self.microphone as source:
                print("🎤 Listening...")
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
            
            text = self.recognizer.recognize_google(audio)
            print(f"🗣️ Heard: {text}")
            return text.lower()
        
        except sr.WaitTimeoutError:
            return "timeout"
        except sr.UnknownValueError:
            return "not_understood"
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return "service_error"
        except Exception as e:
            print(f"Unexpected error: {e}")
            return "error"
    
    def is_wake_word(self, text: str) -> bool:
        """Check if text contains wake words"""
        wake_words = ['hey sop', 'sop assistant', 'help me', 'start procedure']
        return any(wake_word in text.lower() for wake_word in wake_words)
```

### 6. SOP Chat Logic (`sop_chat.py`)
```python
from typing import List, Dict, Optional
from rag_engine import RAGEngine
from groq_client import GroqClient
from voice_handler import VoiceHandler
import json

class SOPChat:
    def __init__(self, rag_engine: RAGEngine, groq_client: GroqClient, voice_handler: VoiceHandler):
        self.rag_engine = rag_engine
        self.groq_client = groq_client
        self.voice_handler = voice_handler
        self.conversation_history = []
        self.current_procedure = None
        self.voice_mode = False
    
    def set_voice_mode(self, enabled: bool):
        """Enable/disable voice mode"""
        self.voice_mode = enabled
    
    def process_query(self, query: str) -> Dict:
        """Process user query and return response"""
        try:
            # Extract intent
            intent_data = self.groq_client.extract_intent(query)
            
            # Search for relevant documents
            relevant_docs = self.rag_engine.search_documents(query, n_results=3)
            
            # Generate response
            response_text = self.groq_client.generate_response(
                query=query,
                context=relevant_docs,
                conversation_history=self.conversation_history[-4:]  # Last 4 messages
            )
            
            # Update conversation history
            self.conversation_history.append({"role": "user", "content": query})
            self.conversation_history.append({"role": "assistant", "content": response_text})
            
            # Voice output if enabled
            if self.voice_mode:
                self.voice_handler.speak(response_text)
            
            return {
                "response": response_text,
                "intent": intent_data,
                "sources": [doc['metadata']['source'] for doc in relevant_docs],
                "confidence": max([doc['relevance_score'] for doc in relevant_docs]) if relevant_docs else 0
            }
        
        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            return {
                "response": error_msg,
                "intent": {"intent": "error", "confidence": 0},
                "sources": [],
                "confidence": 0
            }
    
    def voice_interaction(self):
        """Start voice interaction loop"""
        self.voice_mode = True
        self.voice_handler.speak("SOP Assistant activated. How can I help you today?")
        
        while self.voice_mode:
            user_input = self.voice_handler.listen(timeout=10)
            
            if user_input in ["timeout", "not_understood", "service_error", "error"]:
                if user_input == "timeout":
                    self.voice_handler.speak("I'm still here. Say something or say 'exit' to quit.")
                else:
                    self.voice_handler.speak("I didn't catch that. Please try again.")
                continue
            
            if "exit" in user_input or "quit" in user_input:
                self.voice_handler.speak("Goodbye! Stay safe.")
                break
            
            # Process the query
            response = self.process_query(user_input)
            # Response is already spoken in process_query when voice_mode is True
    
    def get_conversation_history(self) -> List[Dict]:
        """Get conversation history"""
        return self.conversation_history
    
    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
```

### 7. Main Application (`main.py`)
```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from pathlib import Path
import shutil
from typing import List, Optional
import uvicorn

from document_processor import DocumentProcessor
from rag_engine import RAGEngine
from groq_client import GroqClient
from voice_handler import VoiceHandler
from sop_chat import SOPChat

# Initialize components
app = FastAPI(title="Live SOP Interpreter", version="1.0.0")
doc_processor = DocumentProcessor()
rag_engine = RAGEngine()
groq_client = GroqClient()
voice_handler = VoiceHandler()
sop_chat = SOPChat(rag_engine, groq_client, voice_handler)

# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class QueryRequest(BaseModel):
    query: str
    voice_mode: bool = False

class QueryResponse(BaseModel):
    response: str
    intent: dict
    sources: List[str]
    confidence: float

@app.get("/", response_class=HTMLResponse)
async def home():
    """Home page with upload interface"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SOP Interpreter</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
            button { background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; border-radius: 5px; }
            button:hover { background: #45a049; }
            .voice-btn { background: #2196F3; }
            .voice-btn:hover { background: #1976D2; }
            input[type="file"] { margin: 10px 0; }
            .response { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4CAF50; }
        </style>
    </head>
    <body>
        <h1>🛠️ Live SOP Interpreter</h1>
        
        <div class="container">
            <h2>📄 Upload SOP Document</h2>
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" id="fileInput" accept=".pdf,.docx,.md" required>
                <button type="submit">Upload & Process</button>
            </form>
            <div id="uploadStatus"></div>
        </div>
        
        <div class="container">
            <h2>💬 Chat with SOP</h2>
            <input type="text" id="queryInput" placeholder="Ask about the SOP..." style="width: 60%; padding: 10px;">
            <button onclick="sendQuery()">Send</button>
            <button class="voice-btn" onclick="toggleVoice()">🎤 Voice Mode</button>
            <div id="chatResponses"></div>
        </div>
        
        <script>
            let voiceMode = false;
            
            // Upload form handler
            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData();
                const fileInput = document.getElementById('fileInput');
                formData.append('file', fileInput.files[0]);
                
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    document.getElementById('uploadStatus').innerHTML = 
                        `<div style="color: green;">✅ ${result.message}</div>`;
                } catch (error) {
                    document.getElementById('uploadStatus').innerHTML = 
                        `<div style="color: red;">❌ Error: ${error.message}</div>`;
                }
            });
            
            // Send query
            async function sendQuery() {
                const query = document.getElementById('queryInput').value;
                if (!query) return;
                
                try {
                    const response = await fetch('/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: query, voice_mode: voiceMode })
                    });
                    const result = await response.json();
                    
                    const chatDiv = document.getElementById('chatResponses');
                    chatDiv.innerHTML += `
                        <div class="response">
                            <strong>Q:</strong> ${query}<br>
                            <strong>A:</strong> ${result.response}<br>
                            <small>Sources: ${result.sources.join(', ')} | Confidence: ${result.confidence.toFixed(2)}</small>
                        </div>
                    `;
                    
                    document.getElementById('queryInput').value = '';
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            
            // Toggle voice mode
            function toggleVoice() {
                voiceMode = !voiceMode;
                const btn = document.querySelector('.voice-btn');
                btn.textContent = voiceMode ? '🔊 Voice ON' : '🎤 Voice Mode';
                btn.style.background = voiceMode ? '#f44336' : '#2196F3';
            }
            
            // Enter key handler
            document.getElementById('queryInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendQuery();
            });
        </script>
    </body>
    </html>
    """

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process SOP document"""
    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document
        chunks = doc_processor.process_document(str(file_path))
        
        # Add to RAG engine
        rag_engine.add_documents(chunks)
        
        return {
            "message": f"Successfully processed {file.filename}",
            "chunks_created": len(chunks),
            "file_type": file.content_type
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_sop(request: QueryRequest):
    """Query the SOP system"""
    try:
        sop_chat.set_voice_mode(request.voice_mode)
        response = sop_chat.process_query(request.query)
        return QueryResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    return {
        "vector_db_stats": rag_engine.get_collection_stats(),
        "conversation_length": len(sop_chat.get_conversation_history()),
        "supported_formats": [".pdf", ".docx", ".md"]
    }

@app.post("/voice-interaction")
async def start_voice_interaction():
    """Start voice interaction mode"""
    try:
        import threading
        thread = threading.Thread(target=sop_chat.voice_interaction)
        thread.daemon = True
        thread.start()
        return {"message": "Voice interaction started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting voice interaction: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting SOP Interpreter...")
    print("📝 Make sure to set your GROQ_API_KEY in .env file")
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🎯 Quick Start Guide

### 1. Get Groq API Key
```bash
# Sign up at https://console.groq.com/
# Create API key and add to .env file
echo "GROQ_API_KEY=your_key_here" > .env
```

### 2. Run the Application
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

### 3. Access the Interface
- Open `http://localhost:8000` in browser
- Upload SOP document (PDF/DOCX/MD)
- Start chatting with your SOP!

### 4. Voice Mode
- Click "🎤 Voice Mode" to enable voice chat
- Use `/voice-interaction` endpoint for full voice mode

---

## 🔄 WhatsApp Integration (Phase 2)

### Additional Dependencies
```txt
# Add to requirements.txt
twilio==8.10.0
flask-ngrok==0.0.25
```

### WhatsApp Bot Structure
```python
# whatsapp_bot.py
from twilio.twiml.messaging_response import MessagingResponse
from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/whatsapp', methods=['POST'])
def whatsapp_bot():
    """Handle WhatsApp messages"""
    incoming_msg = request.values.get('Body', '').lower()
    response = MessagingResponse()
    
    # Process with SOP chat
    result = sop_chat.process_query(incoming_msg)
    
    response.message(result['response'])
    return str(response)
```

---

## 📈 Demo Flow for Hackathon

### Phase 1 Demo (15 minutes)
1. **Upload Demo** (3 min): Upload sample SOP document
2. **Text Chat** (5 min): Show intelligent Q&A with RAG
3. **Voice Interaction** (5 min): Demonstrate voice commands
4. **Technical Overview** (2 min): Explain RAG + Groq architecture

### Phase 2 Demo (10 minutes)
1. **WhatsApp Integration** (5 min): Show remote SOP guidance
2. **Multi-user Support** (3 min): Multiple workers using same SOP
3. **Future Roadmap** (2 min): Computer vision, IoT integration

---

## 🎯 Key Differentiators

1. **RAG-based**: Contextual understanding of SOPs
2. **Voice-First**: Natural conversation interface
3. **Fast Inference**: Groq API for real-time responses
4. **Scalable**: Ready for WhatsApp/enterprise deployment
5. **Open Source**: Fully transparent and customizable

---

## 🚀 Success Metrics

- **Response Time**: < 2 seconds for queries
- **Accuracy**: 90%+ relevant responses
- **Voice Recognition**: 85%+ accuracy
- **Document Processing**: Support PDF, DOCX, MD
- **Concurrent Users**: 50+ simultaneous chats

Ready to build your hackathon winner! 🏆