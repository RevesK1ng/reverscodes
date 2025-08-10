@echo off
echo ========================================
echo ReversCodes Precise Game Pages Updater
echo ========================================
echo.
echo Starting precise update with section anchor detection...
echo.

python update_game_pages_precise.py

echo.
echo ========================================
echo Precise update completed!
echo Check precise_game_pages_update_summary.json for results
echo ========================================
pause
