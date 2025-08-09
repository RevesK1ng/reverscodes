@echo off
echo ========================================
echo ReversCodes Full Automation Setup
echo ========================================
echo.
echo This script will set up COMPLETE automation for your ReversCodes website.
echo The system will run every 6 hours to keep all 30 game pages updated.
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
echo Setting up scheduled task for ReversCodes updates every 6 hours...
echo.

REM Create the scheduled task that runs every 6 hours
schtasks /create /tn "ReversCodes Game Pages Update" /tr "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File \"%~dp0run_game_pages_update.ps1\" -Silent" /sc hourly /mo 6 /st 09:00 /ru SYSTEM /rl HIGHEST /f

if %errorLevel% == 0 (
    echo.
    echo ========================================
    echo SUCCESS! Full Automation has been set up!
    echo ========================================
    echo.
    echo Your ReversCodes website will now automatically update:
    echo - Every 6 hours (at 9:00 AM, 3:00 PM, 9:00 PM, 3:00 AM)
    echo - All 30 game pages will be updated with fresh codes
    echo - Each game uses 2 reliable sources for maximum accuracy
    echo - The system runs silently in the background
    echo.
    echo Sources used for each game:
    echo - Beebom, Pro Game Guides, IGN, Dexerto, VideoGamer
    echo - MrGuider, Bluestacks, PCGamesN, Khel Now, Twinfinite
    echo - Pocket Tactics, Pocket Gamer, Destructoid
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
    echo To run manually anytime:
    echo Double-click: run_game_pages_update.ps1
    echo.
    echo To check logs:
    echo - game_pages_update.log (detailed logs)
    echo - game_pages_update_summary.json (summary)
    echo.
) else (
    echo.
    echo ERROR: Failed to create scheduled task!
    echo Please check the error message above.
    echo.
)

echo Press any key to exit...
pause >nul
