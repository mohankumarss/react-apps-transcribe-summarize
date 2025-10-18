@echo off
echo Starting Module Federation Microfrontends...
echo.

echo Starting transcript-and-summary on port 5176...
start "Transcript-Summary" cmd /k "cd apps\transcript-and-summary && npm run dev:microfrontend"

echo Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo Starting if-party-master on port 5174...
start "IF-Party-Master" cmd /k "cd apps\if-party-master && npm run dev:microfrontend"

echo Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo Starting shell on port 5175...
start "Shell" cmd /k "cd apps\shell && npm run dev:microfrontend"

echo.
echo All servers starting...
echo - Transcript & Summary: http://localhost:5176
echo - IF Party Master: http://localhost:5174  
echo - Shell: http://localhost:5175
echo.
echo Press any key to exit...
pause > nul
