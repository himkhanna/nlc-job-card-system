# NLC Job Card System - Dev Startup Script
# Usage: Double-click StartNLC.bat

$JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$GRADLE    = "C:\Gradle\gradle-9.4.1\bin\gradle.bat"
$Root      = $PSScriptRoot

$env:JAVA_HOME = $JAVA_HOME
$env:Path      = "$JAVA_HOME\bin;C:\Gradle\gradle-9.4.1\bin;$env:Path"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  NLC Job Card System - Dev Startup   " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker services (Redis + CompreFace)
Write-Host "[1/4] Starting Docker services..." -ForegroundColor Yellow
Set-Location $Root
docker compose up redis compreface-db compreface -d | Out-Null
Write-Host "      Redis started" -ForegroundColor Green
Write-Host "      CompreFace starting in background (takes 2-3 min, ready before you need it)" -ForegroundColor DarkYellow

# 2. Backend (Spring Boot)
Write-Host ""
Write-Host "[2/3] Starting Spring Boot backend..." -ForegroundColor Yellow
$backendCmd = "& { `$env:JAVA_HOME='$JAVA_HOME'; `$env:Path='$JAVA_HOME\bin;C:\Gradle\gradle-9.4.1\bin;' + `$env:Path; Set-Location '$Root\backend'; & '$GRADLE' bootRun }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 3
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 2 -ErrorAction Stop
        if ($r.status -eq "healthy") { $ready = $true; break }
    } catch { }
    $secs = $i * 3
    Write-Host "      Waiting for backend... (${secs}s)" -ForegroundColor Gray
}
if ($ready) {
    Write-Host "      Backend is UP" -ForegroundColor Green
} else {
    Write-Host "      Backend not responding - check the backend window" -ForegroundColor Red
}

# 3. Frontend (Vite)
Write-Host ""
Write-Host "[3/3] Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 8
$frontendPort = 3000
Write-Host "      Frontend is UP" -ForegroundColor Green

# Done
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   All services ready!                " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  App        -> http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  Backend    -> http://localhost:8080"          -ForegroundColor White
Write-Host "  Swagger    -> http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  CompreFace -> http://localhost:8000"          -ForegroundColor White
Write-Host ""
Write-Host "  admin@nlc.demo      / NLC@demo2025" -ForegroundColor Gray
Write-Host "  supervisor@nlc.demo / NLC@demo2025" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..."
cmd /c pause | Out-Null
