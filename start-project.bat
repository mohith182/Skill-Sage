@echo off
echo Starting SkillSage Project...
echo.

echo Starting Backend Server (Port 5000)...
echo (Firebase auth temporarily disabled for development)
start "Backend Server" cmd /k "cd /d %~dp0 && set GEMINI_API_KEY=AIzaSyA3dIPez-0y0jwvJAkcafywl3o1JBrebw0 && npx tsx server/index.ts"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev:client"

echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause > nul

start http://localhost:5173

echo Project is now running!
echo Close this window when you're done.
pause 