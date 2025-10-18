Write-Host "Starting Module Federation Microfrontends..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting transcript-and-summary on port 5176..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\transcript-and-summary'; npm run dev:microfrontend"

Write-Host "Waiting 5 seconds..."
Start-Sleep -Seconds 5

Write-Host "Starting if-party-master on port 5174..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\if-party-master'; npm run dev:microfrontend"

Write-Host "Waiting 5 seconds..."
Start-Sleep -Seconds 5

Write-Host "Starting shell on port 5175..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\shell'; npm run dev:microfrontend"

Write-Host ""
Write-Host "All servers starting..." -ForegroundColor Green
Write-Host "- Transcript & Summary: http://localhost:5176" -ForegroundColor Cyan
Write-Host "- IF Party Master: http://localhost:5174" -ForegroundColor Cyan
Write-Host "- Shell: http://localhost:5175" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
