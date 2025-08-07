# ReversCodes Website Content Updater

This Python script automatically scrapes gaming data from multiple sources and updates your ReversCodes website with fresh content.

## Features

- **Roblox Codes**: Scrapes latest codes from Pro Game Guides, VideoGamer, and Stealthy Gaming
- **GTA 6 News**: Collects headlines from NewsNow, Techwiser, GamingBible, and Unilad Tech
- **Fortnite News**: Gets official updates from Epic Games
- **Call of Duty News**: Fetches latest news from official COD website
- **Automatic HTML Updates**: Replaces placeholder content in your website
- **Comprehensive Logging**: Tracks all scraping activities and errors
- **Windows Task Scheduler Ready**: Easy automation setup

## Prerequisites

- Python 3.7 or higher
- Windows 10/11 (for batch/PowerShell scripts)
- Internet connection

## Installation

1. **Install Python** (if not already installed):
   - Download from [python.org](https://www.python.org/downloads/)
   - Make sure to check "Add Python to PATH" during installation

2. **Clone or download** this script to your website directory

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start

### Method 1: Run Python Script Directly
```bash
python update_site.py
```

### Method 2: Use Batch File (Windows)
```bash
run_update.bat
```

### Method 3: Use PowerShell Script (Windows)
```powershell
.\run_update.ps1
```

For silent execution (no prompts):
```powershell
.\run_update.ps1 -Silent
```

For detailed logging:
```powershell
.\run_update.ps1 -LogToFile
```

## What the Script Does

1. **Scrapes Data Sources**:
   - Roblox codes from 3 gaming websites
   - GTA 6 news from 4 gaming news sites
   - Fortnite news from official Epic Games
   - Call of Duty news from official COD website

2. **Updates Your Website**:
   - Adds dynamic sections to `ReversCodes/index.html`
   - Replaces placeholder content with fresh data
   - Updates timestamp in page title
   - Maintains existing website structure

3. **Generates Reports**:
   - `update.log`: Detailed execution log
   - `update_summary.json`: Summary of scraped content
   - Console output with progress updates

## Data Sources

### Roblox Codes
- Pro Game Guides: https://progameguides.com/roblox/roblox-game-codes/
- VideoGamer: https://www.videogamer.com/guides/roblox-codes-pages/
- Stealthy Gaming: https://stealthygaming.com/category/roblox/roblox-codes/

### GTA 6 News
- NewsNow: https://www.newsnow.com/us/Entertainment/Gaming/GTA+6
- Techwiser: https://techwiser.com/gta-6-could-become-a-creator-platform-rockstar-meets-with-fortnite-and-roblox-communities/
- GamingBible: https://www.gamingbible.com/news/gta-6-online-sounds-like-fortnite-605633-20250218
- Unilad Tech: https://www.uniladtech.com/gaming/new-gta-6-rumor-leaves-everyone-worrying-about-the-future-of-fortnite-068335-20250218

### Fortnite News
- Epic Games Official: https://www.epicgames.com/fortnite/en-US/news

### Call of Duty News
- Call of Duty Official: https://www.callofduty.com/news

## Setting Up Windows Task Scheduler

1. **Open Task Scheduler**:
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create Basic Task**:
   - Click "Create Basic Task" in the right panel
   - Name: "ReversCodes Website Update"
   - Description: "Automatically update website content"

3. **Set Trigger**:
   - Choose frequency (daily, weekly, etc.)
   - Set start time (e.g., 9:00 AM daily)

4. **Set Action**:
   - Action: "Start a program"
   - Program: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\your\run_update.ps1" -Silent`

5. **Finish Setup**:
   - Review settings and click Finish
   - Right-click the task and select "Properties"
   - Check "Run with highest privileges" if needed

## File Structure

```
your-website-directory/
├── update_site.py          # Main Python script
├── requirements.txt        # Python dependencies
├── run_update.bat         # Windows batch file
├── run_update.ps1         # PowerShell script
├── README_UPDATE_SCRIPT.md # This file
├── update.log             # Generated log file
├── update_summary.json    # Generated summary
└── ReversCodes/
    └── index.html         # Your website file (will be updated)
```

## Output Files

### update.log
Detailed execution log with timestamps:
```
2025-01-20 10:30:15 - INFO - Starting website content update...
2025-01-20 10:30:16 - INFO - Scraping Roblox codes from Pro Game Guides
2025-01-20 10:30:18 - INFO - Found 5 Roblox codes
...
```

### update_summary.json
JSON summary of scraped content:
```json
{
  "timestamp": "2025-01-20T10:30:25.123456",
  "roblox_codes_count": 15,
  "gta6_news_count": 6,
  "fortnite_news_count": 5,
  "cod_news_count": 5,
  "status": "success"
}
```

## Troubleshooting

### Common Issues

1. **Python not found**:
   - Install Python and add to PATH
   - Restart command prompt after installation

2. **Module not found errors**:
   - Run: `pip install -r requirements.txt`
   - Check Python version: `python --version`

3. **Permission errors**:
   - Run as Administrator
   - Check file permissions

4. **Network errors**:
   - Check internet connection
   - Some sites may block automated requests
   - Check `update.log` for specific error details

5. **HTML file not found**:
   - Ensure `ReversCodes/index.html` exists
   - Check file path in script

### Debug Mode

To run with verbose logging:
```python
# Edit update_site.py, change logging level to DEBUG
logging.basicConfig(level=logging.DEBUG, ...)
```

### Manual Testing

Test individual functions:
```python
# In Python console
from update_site import GamingDataScraper
scraper = GamingDataScraper()
codes = scraper.scrape_roblox_codes()
print(f"Found {len(codes)} codes")
```

## Customization

### Adding New Data Sources

1. **Edit the script** to add new URLs
2. **Update selectors** for each website's HTML structure
3. **Test thoroughly** before scheduling

### Modifying HTML Output

Edit the `generate_*_html()` methods to change how content is formatted.

### Changing Update Frequency

Modify Task Scheduler settings or add cron-like scheduling in the script.

## Legal and Ethical Considerations

- **Respect robots.txt**: Check each website's robots.txt file
- **Rate limiting**: Script includes delays between requests
- **Terms of service**: Review each website's terms
- **Attribution**: Always credit original sources
- **Fair use**: Only scrape publicly available content

## Support

For issues or questions:
1. Check `update.log` for error details
2. Review this README troubleshooting section
3. Test with manual execution first
4. Verify all dependencies are installed

## Version History

- **v1.0**: Initial release with basic scraping functionality
- Supports Roblox codes, GTA 6, Fortnite, and Call of Duty news
- Windows Task Scheduler integration
- Comprehensive logging and error handling
