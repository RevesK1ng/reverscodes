@echo off
echo ========================================
echo ReversCodes Automation Setup
echo ========================================
echo.
echo This script will set up automatic updates for your ReversCodes website.
echo The system will run every 6 hours to keep your game pages updated.
echo.
echo Please run this as Administrator!
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - Good!
) else (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Setting up scheduled task for ReversCodes updates...
echo.

REM Create the scheduled task
schtasks /create /tn "ReversCodes Game Pages Update" /tr "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File \"%~dp0run_game_pages_update.ps1\" -Silent" /sc daily /st 09:00 /ru SYSTEM /rl HIGHEST /f

if %errorLevel% == 0 (
    echo.
    echo ========================================
    echo SUCCESS! Automation has been set up!
    echo ========================================
    echo.
    echo Your ReversCodes website will now automatically update:
    echo - Every day at 9:00 AM
    echo - All 30 game pages will be updated with fresh codes
    echo - The system runs silently in the background
    echo.
    echo To test the automation, you can:
    echo 1. Open Task Scheduler (Win+R, type: taskschd.msc)
    echo 2. Find "ReversCodes Game Pages Update"
    echo 3. Right-click and select "Run"
    echo.
    echo To modify the schedule:
    echo 1. Open Task Scheduler
    echo 2. Find "ReversCodes Game Pages Update"
    echo 3. Right-click and select "Properties"
    echo 4. Go to "Triggers" tab to change timing
    echo.
) else (
    echo.
    echo ERROR: Failed to create scheduled task!
    echo Please check the error message above.
    echo.
)

echo Press any key to exit...
pause >nul
