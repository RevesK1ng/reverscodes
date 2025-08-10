# ReversCodes Precise Game Pages Updater - PowerShell Script
param(
    [switch]$Silent,
    [switch]$Test
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ReversCodes Precise Game Pages Updater" -ForegroundColor Cyan
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
if (-not (Test-Path "update_game_pages_precise.py")) {
    Write-Host "update_game_pages_precise.py not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "test_precise_extraction.py")) {
    Write-Host "test_precise_extraction.py not found!" -ForegroundColor Red
    exit 1
}

Write-Host "All required files found" -ForegroundColor Green

# Run test if requested
if ($Test) {
    Write-Host "Running precise extraction test..." -ForegroundColor Yellow
    python test_precise_extraction.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Precise extraction test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Precise extraction test failed!" -ForegroundColor Red
        exit 1
    }
    return
}

# Run the main updater
Write-Host "Starting precise game pages update with section anchor detection..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date

python update_game_pages_precise.py

$endTime = Get-Date
$duration = $endTime - $startTime

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Precise update completed successfully!" -ForegroundColor Green
    Write-Host "Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor Green
    Write-Host "Check precise_game_pages_update_summary.json for results" -ForegroundColor Green
    Write-Host "Check precise_game_pages_update.log for detailed logs" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Precise update failed!" -ForegroundColor Red
    Write-Host "Check precise_game_pages_update.log for error details" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

# Keep console open if not silent
if (-not $Silent) {
    Write-Host ""
    Write-Host "Press Enter to continue..." -ForegroundColor Gray
    Read-Host
}
