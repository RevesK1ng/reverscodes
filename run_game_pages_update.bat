@echo off
echo ========================================
echo ReversCodes Game Pages Updater
echo ========================================
echo.
echo Starting comprehensive update of all 30 game pages...
echo.

python update_game_pages.py

echo.
echo ========================================
echo Update completed!
echo Check game_pages_update_summary.json for results
echo ========================================
pause
