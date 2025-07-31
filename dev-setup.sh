#!/bin/bash

# 🚀 Neucom Development Setup Script
# ==================================

set -e

echo "🧠 Setting up Neucom for development..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Set up environment
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your GROQ_API_KEY"
fi

# Backend setup
echo "🐍 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📥 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo "🧠 Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Create directories
mkdir -p uploads vector_db logs

cd ..

# Frontend setup
echo "⚛️ Setting up frontend..."
cd frontend

echo "📥 Installing Node.js dependencies..."
npm install

cd ..

# Install pre-commit hooks
echo "🔧 Installing development tools..."
pip install pre-commit
pre-commit install

echo ""
echo "🎉 Development setup complete!"
echo "=============================="
echo ""
echo "🚀 Next steps:"
echo "   1. Edit .env file and add your GROQ_API_KEY"
echo "   2. Start Neo4j: docker-compose up -d neo4j"
echo "   3. Start backend: cd backend && source venv/bin/activate && python main.py"
echo "   4. Start frontend: cd frontend && npm run dev"
echo ""
echo "🔧 Development commands:"
echo "   Backend tests:    cd backend && pytest"
echo "   Frontend tests:   cd frontend && npm test"
echo "   Full setup:       docker-compose up -d"
echo ""
echo "📚 Documentation: README.md"
echo "🤝 Contributing: CONTRIBUTING.md"
echo ""
echo "Happy coding! 🚀"
