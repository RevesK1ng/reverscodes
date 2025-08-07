# ReversCodes Website Update Script
# PowerShell version with enhanced logging and error handling

param(
    [switch]$Silent,
    [switch]$LogToFile
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Create log file if requested
if ($LogToFile) {
    $logFile = "powershell_update_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    Start-Transcript -Path $logFile -Append
}

try {
    Write-Host "=== ReversCodes Website Update ===" -ForegroundColor Green
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
    
    # Run the update script
    Write-Host "Running website update script..." -ForegroundColor Cyan
    $updateResult = python update_site.py 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Update completed successfully!" -ForegroundColor Green
        Write-Host "Check update.log and update_summary.json for details" -ForegroundColor Yellow
        
        # Display summary if available
        if (Test-Path "update_summary.json") {
            $summary = Get-Content "update_summary.json" | ConvertFrom-Json
            Write-Host "`nUpdate Summary:" -ForegroundColor Cyan
            Write-Host "  Roblox Codes: $($summary.roblox_codes_count)" -ForegroundColor White
            Write-Host "  GTA 6 News: $($summary.gta6_news_count)" -ForegroundColor White
            Write-Host "  Fortnite News: $($summary.fortnite_news_count)" -ForegroundColor White
            Write-Host "  Call of Duty News: $($summary.cod_news_count)" -ForegroundColor White
        }
    } else {
        throw "Update failed with exit code $LASTEXITCODE. Check update.log for details."
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
