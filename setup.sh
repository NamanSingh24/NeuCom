#!/bin/bash

# 🚀 Neucom Quick Setup Script
# ============================

set -e  # Exit on any error

echo "🧠 Starting Neucom Setup..."
echo "=============================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your GROQ_API_KEY"
    echo "   You can get it from: https://console.groq.com/keys"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/vector_db
mkdir -p backend/logs

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check Neo4j
if curl -s http://localhost:7474 > /dev/null; then
    echo "✅ Neo4j is running"
else
    echo "❌ Neo4j failed to start"
fi

# Check Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend failed to start"
fi

# Check Frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎉 Neucom setup complete!"
echo "=========================="
echo ""
echo "🌐 Access Points:"
echo "   Frontend:        http://localhost:5173"
echo "   API Docs:        http://localhost:8000/docs"
echo "   Neo4j Browser:   http://localhost:7474"
echo ""
echo "🔧 Next Steps:"
echo "   1. Edit .env file and add your GROQ_API_KEY"
echo "   2. Upload some documents to get started"
echo "   3. Start asking questions!"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: https://github.com/your-username/neucom/issues"
echo ""
echo "Happy querying! 🚀"
