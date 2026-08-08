@echo off
echo ===================================================
echo Starting Software Archaeologist Local Environment
echo ===================================================

echo [1/3] Starting Python Analyzer Microservice...
start "Python Analyzer" cmd /k "cd analyzer && python main.py"

echo [2/3] Starting React TypeScript Frontend...
start "React Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo Environment launched successfully!
echo Frontend: http://localhost:3000
echo Analyzer: http://localhost:8000
