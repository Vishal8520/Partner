@echo off
title Antigravity AI - Starting Servers...
echo.
echo ============================================
echo   ANTIGRAVITY AI - Starting All Servers
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI on port 8000)...
start "Antigravity Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (Vite on port 5173)...
start "Antigravity Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo ============================================
echo   Both servers are starting up!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo ============================================
echo.
echo You can close this window now.
pause
