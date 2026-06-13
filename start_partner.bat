@echo off
echo =======================================
echo     Starting Partner Platform
echo =======================================

echo.
echo [1/2] Setting up Backend...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing Python dependencies (this might take a moment)...
pip install -r requirements.txt
echo Starting FastAPI Backend on Port 8000...
start "Partner Backend" cmd /k "title Partner Backend && call venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo.
echo [2/2] Setting up Frontend...
cd ..\frontend
echo Installing Node.js dependencies...
call npm install
echo Starting React Vite Server...
start "Partner Frontend" cmd /k "title Partner Frontend && npm run dev"

cd ..
echo.
echo =======================================
echo   Servers are starting in new windows!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo =======================================
pause
