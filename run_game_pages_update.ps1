# ReversCodes Game Pages Update Script
# PowerShell version with enhanced logging and error handling

param(
    [switch]$Silent,
    [switch]$LogToFile
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Create log file if requested
if ($LogToFile) {
    $logFile = "powershell_game_pages_update_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    Start-Transcript -Path $logFile -Append
}

try {
    Write-Host "=== ReversCodes Game Pages Update ===" -ForegroundColor Green
    Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow
    
    # Change to script directory
    Set-Location $PSScriptRoot
    
    # Check if Python is available
    Write-Host "Checking Python installation..." -ForegroundColor Cyan
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Python is not installed or not in PATH. Please install Python and add it to your system PATH."
    }
    Write-Host "Python version: $pythonVersion" -ForegroundColor Green
    
    # Install/update dependencies
    Write-Host "Installing/updating dependencies..." -ForegroundColor Cyan
    $pipResult = pip install -r requirements.txt 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Some dependencies may not have installed correctly: $pipResult"
    } else {
        Write-Host "Dependencies updated successfully" -ForegroundColor Green
    }
    
    # Run the game pages update script
    Write-Host "Running game pages update script..." -ForegroundColor Cyan
    $updateResult = python update_game_pages.py 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Game pages update completed successfully!" -ForegroundColor Green
        Write-Host "Check game_pages_update.log and game_pages_update_summary.json for details" -ForegroundColor Yellow
        
        # Display summary if available
        if (Test-Path "game_pages_update_summary.json") {
            $summary = Get-Content "game_pages_update_summary.json" | ConvertFrom-Json
            Write-Host "`nUpdate Summary:" -ForegroundColor Cyan
            Write-Host "  ASTDX Codes: $($summary.astdx_codes_count)" -ForegroundColor White
            Write-Host "  Blox Fruits Codes: $($summary.blox_fruits_codes_count)" -ForegroundColor White
            Write-Host "  Goalbound Codes: $($summary.goalbound_codes_count)" -ForegroundColor White
            Write-Host "  ASTDX Success: $($summary.astdx_success)" -ForegroundColor White
            Write-Host "  Blox Fruits Success: $($summary.blox_fruits_success)" -ForegroundColor White
            Write-Host "  Goalbound Success: $($summary.goalbound_success)" -ForegroundColor White
        }
    } else {
        throw "Update failed with exit code $LASTEXITCODE. Check game_pages_update.log for details."
    }
    
} catch {
    Write-Error "Script failed: $($_.Exception.Message)"
    if (-not $Silent) {
        Write-Host "Press any key to continue..." -ForegroundColor Red
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    exit 1
} finally {
    if ($LogToFile) {
        Stop-Transcript
    }
}

Write-Host "Script completed at $(Get-Date)" -ForegroundColor Green
if (-not $Silent) {
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
