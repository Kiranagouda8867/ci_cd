#!/bin/bash

# ==========================================
# Flask Backend Setup - macOS/Linux Script
# ==========================================

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Flask + YOLOv8 Backend Setup                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "✓ Python found"
python3 --version
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

if [ -f "app.py" ]; then
    echo "✓ Located backend directory"
else
    echo "❌ Could not find app.py - ensure you're in backend directory"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Create Virtual Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "venv" ]; then
    echo "ℹ Virtual environment already exists"
else
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Activate Virtual Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

source venv/bin/activate
echo "✓ Virtual environment activated"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Install Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "requirements.txt" ]; then
    echo "📥 Installing packages from requirements.txt..."
    pip install --upgrade pip
    pip install -r requirements.txt
    echo "✓ Dependencies installed successfully"
else
    echo "❌ requirements.txt not found"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Verify Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "trained-model/weights/best.pt" ]; then
    echo "✓ Model file found: trained-model/weights/best.pt"
else
    echo "⚠ Warning: Model file not found at trained-model/weights/best.pt"
    echo "  You need to place your trained model at this location"
fi

if [ -f "app.py" ]; then
    echo "✓ Found app.py"
else
    echo "❌ app.py not found"
    exit 1
fi

if [ -f "requirements.txt" ]; then
    echo "✓ Found requirements.txt"
else
    echo "❌ requirements.txt not found"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✓ Setup Complete!                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To start the Flask server, run:"
echo "   python app.py"
echo ""
echo "📡 Server will be available at: http://localhost:5000"
echo ""
echo "🏥 Check health endpoint:"
echo "   curl http://localhost:5000/health"
echo ""
echo "📖 View README.md for full documentation"
echo ""
