@echo off
REM ==========================================
REM Flask Backend Setup - Windows Batch Script
REM ==========================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Flask + YOLOv8 Backend Setup                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo ✓ Python found
python --version
echo.

REM Navigate to backend directory
cd /d "%~dp0"
if "%CD:~-8%"=="frontend" (
    cd ..
)

REM Check if we're in backend directory
if exist "app.py" (
    echo ✓ Located backend directory
) else (
    echo ❌ Could not find app.py - ensure you're in backend directory
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Step 1: Create Virtual Environment
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if exist "venv" (
    echo ℹ Virtual environment already exists
) else (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✓ Virtual environment created
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Step 2: Activate Virtual Environment
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment activated

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Step 3: Install Dependencies
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if exist "requirements.txt" (
    echo 📥 Installing packages from requirements.txt...
    pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed successfully
) else (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Step 4: Verify Setup
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if exist "trained-model\weights\best.pt" (
    echo ✓ Model file found: trained-model\weights\best.pt
) else (
    echo ⚠ Warning: Model file not found at trained-model\weights\best.pt
    echo   You need to place your trained model at this location
)

if exist "app.py" (
    echo ✓ Found app.py
) else (
    echo ❌ app.py not found
    exit /b 1
)

if exist "requirements.txt" (
    echo ✓ Found requirements.txt
) else (
    echo ❌ requirements.txt not found
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✓ Setup Complete!                                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 To start the Flask server, run:
echo    python app.py
echo.
echo 📡 Server will be available at: http://localhost:5000
echo.
echo 🏥 Check health endpoint:
echo    curl http://localhost:5000/health
echo.
echo 📖 View README.md for full documentation
echo.

pause
