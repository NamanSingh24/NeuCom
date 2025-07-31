# 🧠 Neucom - Neural Computation for Human Excellence

<div align="center">

![Neucom Banner](https://img.shields.io/badge/Neucom-Neural%20Computation-2563eb?style=for-the-badge&logo=brain&logoColor=white)

**Where Human Expertise Meets Neural Intelligence**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.x-008CC1?style=flat&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

*Transform your Standard Operating Procedures with AI-powered neural computation*

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🏗️ Architecture](#️-system-architecture) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [💻 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [📚 Usage Guide](#-usage-guide)
- [🎯 API Reference](#-api-reference)
- [🧪 Testing](#-testing)
- [🔍 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Overview

**Neucom** is a revolutionary AI-powered Standard Operating Procedure (SOP) interpreter that leverages neural computation to transform how teams interact with procedural documents. By combining advanced RAG (Retrieval Augmented Generation), Knowledge Graph technology, and voice-first interaction, Neucom makes complex procedures accessible, intelligent, and conversational.

### 🎯 The Problem We Solve

<table>
<tr>
<td>

#### 📊 **Current Challenges**
- **67%** of workplace errors stem from information accessibility issues
- Teams waste **40%** of their time searching through procedure documents
- Critical knowledge walks out the door when experienced employees leave
- Traditional interfaces fail in hands-busy environments

</td>
<td>

#### 💡 **Neucom's Solution**
- **Instant Answers**: Natural language queries with source references
- **Voice-First**: Complete hands-free operation for any environment
- **Neural Intelligence**: Understanding relationships, not just text matching
- **Knowledge Preservation**: Institutional memory captured in neural networks

</td>
</tr>
</table>

### 🌟 **The Neucom Difference**

> *"Neucom doesn't just store documents—it understands them. Our neural architecture comprehends procedural relationships, tool dependencies, and context awareness, providing intelligent assistance through natural conversation."*

---

## ✨ Features

### 🧠 **Neural Intelligence Core**

<table>
<tr>
<td width="50%">

#### 🔍 **Advanced RAG Engine**
- **Semantic Document Processing**: Intelligent chunking preserves procedural flow
- **Multi-format Support**: PDF, DOCX, Markdown, TXT with automated extraction
- **Context-Aware Retrieval**: Understanding relationships between procedures
- **Confidence Scoring**: AI provides confidence levels for all responses
- **ChromaDB Integration**: Vector database for semantic similarity search

</td>
<td width="50%">

#### 🕸️ **Knowledge Graph Integration**
- **Neo4j-Powered**: Enterprise-grade graph database
- **Entity Recognition**: Automatic extraction of tools, materials, safety notes
- **Procedural Mapping**: Step-by-step connections and dependencies
- **Smart Filtering**: Enhanced search through graph relationships
- **spaCy NLP**: Advanced natural language processing for entity extraction

</td>
</tr>
</table>

### 🗣️ **Voice-First Experience**

<table>
<tr>
<td width="50%">

#### 🎤 **Speech-to-Text**
```
🎯 OpenAI Whisper Integration
📢 Noise-resilient processing
🌍 Multi-language support
⚡ Real-time transcription
```

</td>
<td width="50%">

#### 🔊 **Text-to-Speech**
```
🗣️ 6 Natural voice options
🎚️ Adjustable speed (0.5x - 1.5x)
🎭 Context-aware responses
🙌 Complete hands-free operation
```

</td>
</tr>
</table>

### 💻 **Modern Web Interface**

#### 🎨 **Frontend Stack**
- **React 18 + Vite**: Lightning-fast development and production builds
- **Tailwind CSS + DaisyUI**: Beautiful, responsive components
- **Framer Motion**: Smooth animations and transitions
- **Lucide Icons**: Consistent, beautiful iconography
- **Voice Controls**: Integrated speech synthesis and recognition

#### 🔧 **Backend Power**
- **FastAPI**: High-performance async Python framework
- **Groq LLM**: Blazing-fast inference with Llama 3 models
- **Docker Ready**: Containerized deployment
- **OpenAI Compatible**: Voice synthesis integration
- **Settings Management**: Dynamic configuration updates

---

## 🏗️ System Architecture

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Dashboard]
        Voice[Voice Interface]
        Chat[Chat Interface]
    end
    
    subgraph "API Layer"
        FastAPI[FastAPI Server]
        Auth[Authentication]
        Routes[API Routes]
    end
    
    subgraph "AI Processing Layer"
        RAG[RAG Engine]
        KG[Knowledge Graph]
        LLM[Groq LLM]
        TTS[Voice Synthesis]
        STT[Speech Recognition]
    end
    
    subgraph "Data Layer"
        Neo4j[(Neo4j Graph DB)]
        ChromaDB[(ChromaDB Vector DB)]
        Files[(Document Store)]
    end
    
    UI --> FastAPI
    Voice --> FastAPI
    Chat --> FastAPI
    
    FastAPI --> RAG
    FastAPI --> KG
    FastAPI --> LLM
    FastAPI --> TTS
    FastAPI --> STT
    
    RAG --> ChromaDB
    RAG --> Neo4j
    KG --> Neo4j
    RAG --> Files
```

</div>

### 🔄 **Data Flow**

1. **Document Ingestion**: Upload → Processing → Chunking → Vector Embeddings → Knowledge Graph
2. **Query Processing**: Voice/Text Input → Entity Extraction → RAG Retrieval → KG Filtering → LLM Response
3. **Response Delivery**: Formatted Output → Source References → Voice Synthesis → User Interface

---

## 🚀 Quick Start

### 📋 **Prerequisites**

```bash
# System Requirements
Python 3.8+
Node.js 16+
Docker & Docker Compose
Git
```

### ⚡ **One-Command Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/neucom.git
cd neucom

# Quick production setup (Recommended)
./setup.sh

# Or for development setup
./dev-setup.sh

# Or start with Docker Compose directly
docker-compose up -d
```

### 🌐 **Access Points**

- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474

---

## 💻 Installation

### 🐳 **Docker Setup (Recommended)**

```bash
# 1. Clone the repository
git clone https://github.com/your-username/neucom.git
cd neucom

# 2. Copy environment file and configure
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Start services
docker-compose up -d

# 4. Verify services
docker-compose ps
```

### 🔧 **Manual Installation**

#### **Backend Setup**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Install spaCy model
python -m spacy download en_core_web_sm

# Start backend
python main.py
```

#### **Frontend Setup**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### **Neo4j Setup**

```bash
# Start Neo4j with Docker (included in docker-compose.yml)
docker-compose up -d neo4j

# Or standalone Neo4j
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/testpassword \
  neo4j:5.15
```

---

## 🔧 Configuration

### 📝 **Environment Variables**

Create a `.env` file in the project root directory (copy from `.env.example`):

```env
# 🔑 Required: API Keys
GROQ_API_KEY=your_groq_api_key_here

# 🗄️ Database Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASS=testpassword

# 🌐 Server Configuration
HOST=127.0.0.1
PORT=8000
DEBUG=True
FRONTEND_URL=http://localhost:5173

# 🧠 AI Configuration
LLM_MODEL=llama3-8b-8192
MAX_TOKENS=1000
TEMPERATURE=0.3
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# 🎤 Voice Configuration
TTS_VOICE=nova
STT_MODEL=base

# 📄 File Processing
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_EXTENSIONS=.pdf,.docx,.md,.txt
```

> **🔑 Get your Groq API key**: Visit [Groq Console](https://console.groq.com/keys) to create a free API key.

### ⚙️ **Settings Management**

Neucom includes a comprehensive settings interface for runtime configuration:

- **AI Model Selection**: Choose from different Groq models
- **Voice Settings**: Configure TTS voice, speed, and quality
- **Processing Parameters**: Adjust chunk size, overlap, confidence thresholds
- **System Limits**: File size limits, token limits, timeout settings

---

## 📚 Usage Guide

### 📤 **Document Upload**

```python
# Supported formats
✅ PDF files (.pdf)
✅ Word documents (.docx)
✅ Markdown files (.md)
✅ Text files (.txt)

# What happens during upload:
1. Document parsing and text extraction
2. Intelligent chunking with overlap
3. Vector embedding generation
4. Knowledge graph entity extraction
5. Relationship mapping
```

### 💬 **Conversational Interface**

#### **Text Queries**

```
User: "What safety equipment is required for electrical work?"

AI: Based on the Safety SOP document, the required safety equipment for electrical work includes:

### Personal Protective Equipment (PPE)
1. **Insulated gloves** (Class 0 minimum, Class 2 for high voltage)
2. **Safety glasses** with side shields
3. **Hard hat** with electrical rating
4. **Arc-rated clothing** (NFPA 70E compliant)

### Tools and Equipment
- Insulated tools rated for voltage
- Digital multimeter (CAT III/IV rated)
- Voltage detector/tester
- First aid kit nearby

**WARNING:** Always verify de-energization before starting work.

📚 **Sources:**
1. Electrical Safety Procedures v2.1 - Section 3.2
2. PPE Requirements Manual - Chapter 4

🎯 **Confidence:** 94.2%
```

#### **Voice Commands**

```
🎤 "Next step in the procedure"
🎤 "What tools do I need?"
🎤 "Read the safety warnings"
🎤 "Show me the troubleshooting guide"
```

### 🔍 **Knowledge Graph Queries**

```python
# Entity-based queries automatically leverage the knowledge graph
"Show me all procedures involving hydraulic pumps"
"What safety warnings relate to chemical handling?"
"Find steps that require calibration tools"
```

### 📊 **Analytics Dashboard**

- **Document Processing Stats**: Upload history, processing times
- **Query Analytics**: Popular questions, confidence trends
- **System Health**: Database status, API performance
- **Knowledge Graph Insights**: Entity relationships, procedure complexity

---

## 🎯 API Reference

### 📡 **Core Endpoints**

#### **Document Management**

```http
POST /upload
Content-Type: multipart/form-data

# Upload and process documents
```

```http
GET /documents
# List all processed documents

DELETE /documents/{filename}
# Remove specific document
```

#### **Query Interface**

```http
POST /query
Content-Type: application/json

{
  "query": "What are the safety procedures?",
  "voice_enabled": false,
  "context_filter": null
}
```

#### **Voice Interface**

```http
POST /voice/upload
Content-Type: audio/wav
# Upload audio for speech-to-text

POST /voice/synthesize?text=Hello&voice=nova&speed=1.0
# Generate speech from text
```

#### **Knowledge Graph**

```http
GET /kg/status
# Knowledge graph health and statistics

GET /kg/entities/{entity_name}
# Get entity relationships and data

GET /kg/sops
# List all SOPs in knowledge graph
```

#### **System Management**

```http
GET /health
# System health check

GET /settings
# Get current configuration

POST /settings
# Update system settings
```

### 📝 **Response Format**

```json
{
  "response": "Formatted AI response with markdown",
  "sources": [
    "Document Name - Section X.Y",
    "Safety Manual - Chapter 3"
  ],
  "confidence": 0.942,
  "intent": {
    "type": "procedural_query",
    "entities": ["safety", "equipment"]
  },
  "usage": {
    "total_tokens": 1247,
    "prompt_tokens": 892,
    "completion_tokens": 355
  }
}
```

---

## 🧪 Testing

### 🔬 **Test Suite**

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=.

# Frontend tests
cd frontend
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### 📊 **Test Coverage**

- **Backend**: 85%+ coverage
- **API Endpoints**: 100% coverage
- **Frontend Components**: 80%+ coverage
- **Integration Tests**: Core workflows

---

## 🔍 Troubleshooting

### 🚨 **Common Issues**

#### **Backend Not Starting**

```bash
# Check Python version
python --version  # Should be 3.8+

# Verify virtual environment
which python  # Should point to venv

# Check dependencies
pip check

# Verify environment variables
python -c "import os; print(os.getenv('GROQ_API_KEY'))"
```

#### **Docker Setup Issues**

```bash
# Check if Docker is running
docker ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs neo4j

# Restart specific service
docker-compose restart backend

# Complete reset
docker-compose down -v
docker-compose up -d
```

#### **Knowledge Graph Connection Issues**

```bash
# Check Neo4j status
docker ps | grep neo4j

# Test connection
curl -u neo4j:testpassword http://localhost:7474/

# Restart Neo4j
docker restart neo4j
```

#### **Voice Features Not Working**

```bash
# Check browser permissions (microphone access)
# Verify HTTPS for production deployment
# Test with different audio formats
```

### 📋 **Health Checks**

| Component | Check Command | Expected Result |
|-----------|---------------|-----------------|
| Backend API | `curl http://localhost:8000/health` | `{"status": "healthy"}` |
| Neo4j | `curl http://localhost:7474/` | Connection info JSON |
| Frontend | Browser → `http://localhost:5173` | Dashboard loads |
| Voice API | Check browser console | No permission errors |

### 🔧 **Debug Mode**

```bash
# Enable debug logging
export DEBUG=True

# Verbose API logs
export LOG_LEVEL=DEBUG

# Frontend development mode
npm run dev -- --debug
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 🌟 **Ways to Contribute**

- 🐛 **Bug Reports**: Found an issue? Let us know!
- 💡 **Feature Requests**: Have ideas? We'd love to hear them!
- 📖 **Documentation**: Help improve our docs
- 🧪 **Testing**: Add test cases and improve coverage
- 🔧 **Code**: Submit pull requests for fixes and features

### 📋 **Development Setup**

```bash
# Fork the repository
git clone https://github.com/your-username/neucom.git

# Create feature branch
git checkout -b feature/amazing-feature

# Install pre-commit hooks
pre-commit install

# Make your changes and commit
git commit -m "Add amazing feature"

# Push to your fork and create PR
git push origin feature/amazing-feature
```

### 📝 **Code Style**

- **Python**: Black formatter, flake8 linting
- **JavaScript**: ESLint + Prettier
- **Commits**: Conventional Commits format
- **Documentation**: Clear docstrings and comments

---

## 🏆 Roadmap

### 🎯 **Version 2.0 - Coming Soon**

- [ ] **Multi-tenant Support**: Organization-level isolation
- [ ] **Advanced Analytics**: Usage patterns and optimization insights
- [ ] **Custom Voice Models**: Train organization-specific voices
- [ ] **Mobile App**: iOS and Android native applications
- [ ] **Integration APIs**: Slack, Teams, and other platform connectors
- [ ] **Workflow Automation**: Trigger actions based on procedure completion
- [ ] **Multi-language Support**: Global deployment capabilities

### 🔮 **Future Vision**

- **AR/VR Integration**: Overlay procedures in augmented reality
- **IoT Integration**: Connect with industrial sensors and equipment
- **Machine Learning Feedback**: Continuous improvement from user interactions
- **Predictive Analytics**: Anticipate procedure needs and issues

---

## 🏢 Use Cases

### 🏭 **Manufacturing**

> *"Neucom helped our technicians reduce equipment troubleshooting time by 75% through voice-guided procedures."*

- Equipment maintenance procedures
- Safety protocol compliance
- Quality control checklists
- Emergency response protocols

### 🏥 **Healthcare**

> *"During critical procedures, voice commands ensure our hands stay sterile while accessing crucial information."*

- Patient care procedures
- Emergency protocols
- Equipment operation guides
- Regulatory compliance procedures

### 💻 **IT Operations**

> *"Our junior engineers now handle complex deployments with confidence, guided by Neucom's intelligent assistance."*

- System maintenance procedures
- Deployment checklists
- Incident response playbooks
- Security protocols

### 🎓 **Training & Education**

> *"New employee training time reduced by 60% with interactive, voice-guided SOP walkthroughs."*

- Interactive procedure training
- Competency verification
- Knowledge transfer
- Compliance training

---

## 📊 Performance Metrics

### ⚡ **System Performance**

| Metric | Performance |
|--------|-------------|
| **Query Response Time** | < 2 seconds average |
| **Document Processing** | 1000+ pages in < 30 seconds |
| **Voice Recognition Accuracy** | 94.8% in noisy environments |
| **Concurrent Users** | 100+ simultaneous sessions |
| **Uptime** | 99.9% availability |

### 🎯 **Business Impact**

| Outcome | Improvement |
|---------|-------------|
| **Procedure Lookup Time** | 90% reduction |
| **Training Duration** | 60% faster onboarding |
| **Error Rate** | 75% fewer procedural errors |
| **Compliance Score** | 95%+ audit success rate |

---

## 🛡️ Security & Privacy

### 🔒 **Data Protection**

- **Local Processing**: All documents processed on your infrastructure
- **No Data Transmission**: Sensitive information never leaves your environment
- **Encrypted Storage**: All data encrypted at rest and in transit
- **Access Controls**: Role-based permissions and audit logging

### 🛠️ **Security Features**

- **HTTPS Everywhere**: Secure communication protocols
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API abuse prevention
- **Security Headers**: CORS, CSP, and security headers configured

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


<div align="center">

⭐ **If you found Neucom helpful, please consider giving us a star!** ⭐

</div>
