@echo off
title SkillSage Project Startup
color 0A

echo.
echo ================================================================
echo                    🎓 SKILLSAGE PROJECT STARTUP
echo ================================================================
echo.

echo 🔧 Setting up environment variables...
set GEMINI_API_KEY=AIzaSyA3dIPez-0y0jwvJAkcafywl3o1JBrebw0
set NODE_ENV=development
set PORT=5000

echo ✅ Environment variables set:
echo    - GEMINI_API_KEY: ****CONFIGURED****
echo    - NODE_ENV: development
echo    - PORT: 5000
echo.

echo 🚀 Starting Backend Server (Express + Gemini AI)...
start "SkillSage Backend (Port 5000)" cmd /k "title SkillSage Backend && cd /d %~dp0 && set GEMINI_API_KEY=AIzaSyA3dIPez-0y0jwvJAkcafywl3o1JBrebw0 && set NODE_ENV=development && echo Starting backend with AI capabilities... && npx tsx server/index.ts"

echo ⏳ Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo 🌐 Starting Frontend Server (React + Vite)...
start "SkillSage Frontend" cmd /k "title SkillSage Frontend && cd /d %~dp0 && echo Starting React frontend... && npm run dev:client"

echo ⏳ Waiting 3 seconds for frontend to start...
timeout /t 3 /nobreak > nul

echo.
echo ================================================================
echo                    🎉 SKILLSAGE IS STARTING!
echo ================================================================
echo.
echo 📱 Your application will open in the browser automatically
echo 🖥️  Backend API: http://localhost:5000
echo 🌐 Frontend App: Will auto-detect available port
echo.
echo 🤖 AI Features Now Available:
echo    ✅ AI Career Mentor Chat (Powered by Gemini)
echo    ✅ Mock Interview Simulator 
echo    ✅ Resume Analysis
echo    ✅ Job Search Integration
echo.
echo Press any key to open the application...
pause > nul

echo 🌐 Opening SkillSage in your browser...
timeout /t 2 /nobreak > nul

REM Try to open different possible ports
start http://localhost:5173 2>nul
timeout /t 1 /nobreak > nul
start http://localhost:5174 2>nul  
timeout /t 1 /nobreak > nul
start http://localhost:5175 2>nul
timeout /t 1 /nobreak > nul
start http://localhost:5176 2>nul
timeout /t 1 /nobreak > nul
start http://localhost:5177 2>nul

echo.
echo ================================================================
echo                    ✅ SKILLSAGE IS NOW RUNNING!
echo ================================================================
echo.
echo 💡 Tips:
echo    - Both servers are running in separate windows
echo    - Close those windows to stop the servers
echo    - Your AI mentor can now answer questions from AI_Questions_List.txt
echo    - The mock interview simulator is fully functional
echo.
echo 🔒 Security Note: API keys are configured for development
echo.
echo Press any key to close this startup window...
pause 