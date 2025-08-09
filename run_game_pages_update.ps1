# ReversCodes Game Pages Updater - PowerShell Script
param(
    [switch]$Silent,
    [switch]$Test
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ReversCodes Game Pages Updater" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Python not found! Please install Python and add to PATH" -ForegroundColor Red
    exit 1
}

# Check if required files exist
Write-Host "Checking required files..." -ForegroundColor Yellow
if (-not (Test-Path "update_game_pages.py")) {
    Write-Host "update_game_pages.py not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "test_update_script.py")) {
    Write-Host "test_update_script.py not found!" -ForegroundColor Red
    exit 1
}

Write-Host "All required files found" -ForegroundColor Green

# Run test if requested
if ($Test) {
    Write-Host "Running test script..." -ForegroundColor Yellow
    python test_update_script.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Test failed!" -ForegroundColor Red
        exit 1
    }
    return
}

# Run the main updater
Write-Host "Starting comprehensive game pages update..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date

python update_game_pages.py

$endTime = Get-Date
$duration = $endTime - $startTime

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Update completed successfully!" -ForegroundColor Green
    Write-Host "Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor Green
    Write-Host "Check game_pages_update_summary.json for results" -ForegroundColor Green
    Write-Host "Check game_pages_update.log for detailed logs" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Update failed!" -ForegroundColor Red
    Write-Host "Check game_pages_update.log for error details" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

# Keep console open if not silent
if (-not $Silent) {
    Write-Host ""
    Write-Host "Press Enter to continue..." -ForegroundColor Gray
    Read-Host
}
