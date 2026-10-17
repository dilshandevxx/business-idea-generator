# PowerShell Runner for Business Idea Generator
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 Launching IdeaSpark - AI Business Idea Generator" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Python Dependencies
Write-Host "[1/3] Ensuring FastAPI & Python backend dependencies..." -ForegroundColor Green
python -m pip install -r requirements.txt --quiet

# 2. Check Node Dependencies
Write-Host "[2/3] Checking Next.js frontend packages..." -ForegroundColor Green
if (-not (Test-Path "saas/node_modules")) {
    Push-Location "saas"
    npm install
    Pop-Location
}

# 3. Start Backend in background PowerShell window
Write-Host "[3/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FastAPI Backend Running on http://127.0.0.1:8000' -ForegroundColor Green; python -m uvicorn saas.api.index:app --host 127.0.0.1 --port 8000 --reload"

# 4. Start Next.js Frontend in current console
Write-Host "Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Yellow
Push-Location "saas"
npm run dev
