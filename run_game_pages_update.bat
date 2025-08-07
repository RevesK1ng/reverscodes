@echo off
echo Starting ReversCodes Game Pages Update...
echo Timestamp: %date% %time%

cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python and add it to your system PATH
    pause
    exit /b 1
)

REM Install dependencies if needed
echo Installing/updating dependencies...
pip install -r requirements.txt

REM Run the game pages update script
echo Running game pages update script...
python update_game_pages.py

REM Check if the script ran successfully
if errorlevel 1 (
    echo Update failed! Check game_pages_update.log for details
    pause
    exit /b 1
) else (
    echo Game pages update completed successfully!
    echo Check game_pages_update.log and game_pages_update_summary.json for details
)

pause
