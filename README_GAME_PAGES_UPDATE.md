# ReversCodes Comprehensive Game Pages Updater

This Python script updates **ALL** existing game pages, gaming content pages, and dates across your entire website. It's a complete solution that ensures every piece of content gets fresh updates.

## What This Script Does

✅ **Updates ALL Individual Game Pages**:
- ASTDX page (`astdx.html`) - Updates codes and dates
- Blox Fruits page (`blox-fruits.html`) - Updates codes and dates  
- Goalbound page (`goalbound.html`) - Updates codes and dates
- Anime Adventures page (`animeadventures.html`) - Updates dates
- Dress to Impress page (`dresstoimpress.html`) - Updates dates
- Fruit Battlegrounds page (`fruitbattlegrounds.html`) - Updates dates
- Blox Fruits Page (`bloxfruits-page.html`) - Updates dates

✅ **Updates ALL Subdirectory Game Pages**:
- ASTDX subdirectory (`astdx/index.html`) - Updates dates
- Goalbound subdirectory (`goalbound/index.html`) - Updates dates
- Rivals subdirectory (`rivals/index.html`) - Updates dates

✅ **Updates Homepage Game Sections**:
- All "Active Codes" sections on homepage (`index.html`)
- All "Latest Update" sections on homepage
- Main "Last Updated" date on homepage

✅ **Updates Gaming Content Pages**:
- Trending page (`trending.html`) - Updates dates
- Guides page (`guides.html`) - Updates dates

✅ **Updates ALL Other Pages with Dates**:
- Contact page (`contact.html`)
- Related Content page (`related-content.html`)
- Privacy pages (all subdirectories)
- Terms pages (all subdirectories)
- Disclaimer page (`disclaimer.html`)

✅ **Removes Dynamic Sections**:
- Removes any dynamic sections that were previously added to the homepage
- Restores the original homepage title

✅ **Updates ALL Dates**:
- "Last Updated" dates on all pages
- "Active Codes" section dates
- "Latest Update" dates
- Privacy/Terms page dates

## Features

- **Comprehensive Coverage**: Updates EVERY page with gaming content or dates
- **Scrapes Real Codes**: Attempts to scrape fresh codes from gaming websites
- **Fallback Codes**: Uses known working codes if scraping fails
- **Date Updates**: Automatically updates all date references across the site
- **Homepage Cleanup**: Removes any previously added dynamic sections
- **Subdirectory Support**: Updates pages in all subdirectories
- **Comprehensive Logging**: Tracks all update activities
- **Error Handling**: Continues updating other pages if one fails

## Prerequisites

- Python 3.7 or higher
- Windows 10/11 (for batch/PowerShell scripts)
- Internet connection

## Installation

1. **Install Python** (if not already installed):
   - Download from [python.org](https://www.python.org/downloads/)
   - Make sure to check "Add Python to PATH" during installation

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start

### Method 1: Run Python Script Directly
```bash
python update_game_pages.py
```

### Method 2: Use Batch File (Windows)
```bash
run_game_pages_update.bat
```

### Method 3: Use PowerShell Script (Windows)
```powershell
.\run_game_pages_update.ps1
```

For silent execution (no prompts):
```powershell
.\run_game_pages_update.ps1 -Silent
```

For detailed logging:
```powershell
.\run_game_pages_update.ps1 -LogToFile
```

## What Gets Updated

### Individual Game Pages
- **ASTDX page** (`astdx.html`) - Active codes, expired codes, all dates
- **Blox Fruits page** (`blox-fruits.html`) - Last updated, active codes title, codes note
- **Goalbound page** (`goalbound.html`) - Active codes date, last updated, latest update
- **Anime Adventures page** (`animeadventures.html`) - Active codes date
- **Dress to Impress page** (`dresstoimpress.html`) - Active codes date
- **Fruit Battlegrounds page** (`fruitbattlegrounds.html`) - Active codes date
- **Blox Fruits Page** (`bloxfruits-page.html`) - Active codes date

### Subdirectory Game Pages
- **ASTDX subdirectory** (`astdx/index.html`) - Last updated date
- **Goalbound subdirectory** (`goalbound/index.html`) - Last updated date
- **Rivals subdirectory** (`rivals/index.html`) - Last updated date

### Homepage (`index.html`)
- **All Game Sections**: Updates every "Active Codes" section with current date
- **Latest Updates**: Updates all "Latest Update" sections
- **Main Date**: Updates the main "Last Updated" date
- **Removes**: All dynamic sections (Roblox codes, GTA 6 news, Fortnite news, Call of Duty news)
- **Restores**: Original title without timestamp

### Gaming Content Pages
- **Trending page** (`trending.html`) - All date references
- **Guides page** (`guides.html`) - All date references

### Other Pages
- **Contact page** (`contact.html`) - Last updated date
- **Related Content page** (`related-content.html`) - Last updated span
- **Privacy pages** - All privacy.html files in main and subdirectories
- **Terms pages** - All terms.html files in main and subdirectories
- **Disclaimer page** (`disclaimer.html`) - Last updated date

## Data Sources

The script attempts to scrape codes from:
- **Pro Game Guides**: https://progameguides.com/roblox/
- **VideoGamer**: https://www.videogamer.com/guides/

If scraping fails, it uses known working codes as fallback.

## Output Files

### game_pages_update.log
Detailed execution log:
```
2025-08-07 08:04:07,478 - INFO - Starting comprehensive game pages update...
2025-08-07 08:04:07,478 - INFO - Removing dynamic sections from homepage...
2025-08-07 08:04:09,569 - INFO - Scraping ASTDX codes from Pro Game Guides
2025-08-07 08:04:12,717 - INFO - Successfully updated ReversCodes/astdx.html
2025-08-07 08:04:13,123 - INFO - Successfully updated ReversCodes/animeadventures.html
2025-08-07 08:04:13,456 - INFO - Successfully updated ReversCodes/dresstoimpress.html
...
```

### game_pages_update_summary.json
JSON summary of updates:
```json
{
  "timestamp": "2025-08-07T08:04:20.888394",
  "astdx_codes_count": 10,
  "blox_fruits_codes_count": 10,
  "goalbound_codes_count": 5,
  "anime_adventures_codes_count": 5,
  "dress_to_impress_codes_count": 5,
  "fruit_battlegrounds_codes_count": 5,
  "rivals_codes_count": 5,
  "astdx_success": true,
  "blox_fruits_success": true,
  "goalbound_success": true,
  "anime_adventures_success": true,
  "dress_to_impress_success": true,
  "fruit_battlegrounds_success": true,
  "bloxfruits_page_success": true,
  "astdx_sub_success": true,
  "goalbound_sub_success": true,
  "rivals_sub_success": true,
  "homepage_success": true,
  "gaming_content_success": true,
  "other_pages_success": true,
  "status": "success"
}
```

## Setting Up Windows Task Scheduler

1. **Open Task Scheduler**:
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create Basic Task**:
   - Name: `ReversCodes Comprehensive Game Pages Update`
   - Description: `Update ALL game pages, gaming content pages, and dates across the entire website`

3. **Set Trigger**:
   - Choose "Daily"
   - Set start time (e.g., 9:00 AM)

4. **Set Action**:
   - Program: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\your\run_game_pages_update.ps1" -Silent`

5. **Finish Setup**:
   - Check "Run with highest privileges"
   - Check "Allow task to be run on demand"

## File Structure

```
your-website-directory/
├── update_game_pages.py              # Main comprehensive Python script
├── run_game_pages_update.bat         # Windows batch file
├── run_game_pages_update.ps1         # PowerShell script
├── requirements.txt                  # Python dependencies
├── README_GAME_PAGES_UPDATE.md       # This file
├── game_pages_update.log             # Generated log file
├── game_pages_update_summary.json    # Generated summary
└── ReversCodes/
    ├── index.html                    # Homepage (all sections updated)
    ├── astdx.html                    # ASTDX page (updated)
    ├── blox-fruits.html              # Blox Fruits page (updated)
    ├── goalbound.html                # Goalbound page (updated)
    ├── animeadventures.html          # Anime Adventures page (updated)
    ├── dresstoimpress.html           # Dress to Impress page (updated)
    ├── fruitbattlegrounds.html       # Fruit Battlegrounds page (updated)
    ├── bloxfruits-page.html          # Blox Fruits page (updated)
    ├── trending.html                 # Trending page (updated)
    ├── guides.html                   # Guides page (updated)
    ├── contact.html                  # Contact page (updated)
    ├── related-content.html          # Related content page (updated)
    ├── privacy.html                  # Privacy page (updated)
    ├── terms.html                    # Terms page (updated)
    ├── disclaimer.html               # Disclaimer page (updated)
    ├── astdx/
    │   ├── index.html                # ASTDX subdirectory (updated)
    │   ├── privacy.html              # ASTDX privacy (updated)
    │   └── terms.html                # ASTDX terms (updated)
    ├── goalbound/
    │   ├── index.html                # Goalbound subdirectory (updated)
    │   ├── privacy.html              # Goalbound privacy (updated)
    │   └── terms.html                # Goalbound terms (updated)
    └── rivals/
        ├── index.html                # Rivals subdirectory (updated)
        ├── privacy.html              # Rivals privacy (updated)
        └── terms.html                # Rivals terms (updated)
```

## Troubleshooting

### Common Issues

1. **Python not found**:
   - Install Python and add to PATH
   - Restart command prompt after installation

2. **Module not found errors**:
   - Run: `pip install -r requirements.txt`

3. **Permission errors**:
   - Run as Administrator
   - Check file permissions

4. **No codes found**:
   - Check `game_pages_update.log` for scraping errors
   - Script will use fallback codes if scraping fails

5. **Some pages not updated**:
   - Check if files exist in expected locations
   - Verify file paths in the script

6. **Homepage not cleaned up**:
   - Check if dynamic sections were properly removed
   - Verify title was restored

### Debug Mode

To run with verbose logging:
```python
# Edit update_game_pages.py, change logging level to DEBUG
logging.basicConfig(level=logging.DEBUG, ...)
```

## Customization

### Adding New Game Pages

1. **Add scraping method**:
   ```python
   def scrape_new_game_codes(self) -> Dict:
       # Add scraping logic
       pass
   ```

2. **Add update method**:
   ```python
   def update_new_game_page(self, codes_data: Dict) -> bool:
       # Add update logic
       pass
   ```

3. **Update run_update method**:
   ```python
   # Add to run_update method
   new_game_codes = self.scrape_new_game_codes()
   new_game_success = self.update_new_game_page(new_game_codes)
   ```

### Modifying Code Sources

Edit the `sources` lists in each scraping method to add or remove websites.

### Changing Date Format

Modify the `datetime.now().strftime()` calls to change date format.

## Legal and Ethical Considerations

- **Respect robots.txt**: Check each website's robots.txt file
- **Rate limiting**: Script includes delays between requests
- **Terms of service**: Review each website's terms
- **Attribution**: Always credit original sources
- **Fair use**: Only scrape publicly available content

## Support

For issues or questions:
1. Check `game_pages_update.log` for error details
2. Review this README troubleshooting section
3. Test with manual execution first
4. Verify all dependencies are installed

## Version History

- **v2.0**: Comprehensive update - covers ALL pages and content
- **v1.0**: Initial release - basic game pages only

## Summary

This comprehensive updater ensures that **EVERY** page on your website with gaming content or dates gets automatically updated. No more manual updates needed - just run the script and your entire site will have fresh content and current dates!
