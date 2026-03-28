# NLC Job Card System — Dev Startup Script
# Run: powershell -ExecutionPolicy Bypass -File start-dev.ps1

$dotnet = "C:\Program Files\dotnet\dotnet.exe"
$root   = $PSScriptRoot

Write-Host "`n=== NLC Job Card System — Dev Startup ===" -ForegroundColor Cyan

# 1. Start Docker services if Docker is available
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "`n[1/3] Starting PostgreSQL + Redis via Docker..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 3
} else {
    Write-Host "`n[1/3] Docker not found — ensure PostgreSQL (port 5432) and Redis (port 6379) are running manually." -ForegroundColor Yellow
}

# 2. Run EF migrations
Write-Host "`n[2/3] Applying database migrations..." -ForegroundColor Yellow
& $dotnet ef database update --project "$root\backend\src\NLC.Infrastructure" --startup-project "$root\backend\src\NLC.API"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Migration failed — check PostgreSQL connection string in appsettings.json" -ForegroundColor Red
}

# 3. Start backend in a new window
Write-Host "`n[3/3] Starting backend API on http://localhost:5144 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\src\NLC.API'; & '$dotnet' run"

# 4. Start frontend
Write-Host "`nStarting frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`n=== All services launching ===" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5144" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Health:   http://localhost:5144/health" -ForegroundColor White
Write-Host "  API docs: http://localhost:5144/openapi/v1.json`n" -ForegroundColor White
