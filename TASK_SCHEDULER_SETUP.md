# Windows Task Scheduler Setup Guide

This guide will help you set up automatic website updates using Windows Task Scheduler.

## Prerequisites

- Windows 10/11
- Python installed and added to PATH
- All script files in your website directory

## Step-by-Step Setup

### Method 1: Using Task Scheduler GUI

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type `taskschd.msc`
   - Press Enter

2. **Create Basic Task**
   - In the right panel, click "Create Basic Task"
   - Name: `ReversCodes Website Update`
   - Description: `Automatically update website content with fresh gaming data`
   - Click "Next"

3. **Set Trigger**
   - Choose "Daily"
   - Click "Next"
   - Set start time (e.g., 9:00 AM)
   - Click "Next"

4. **Set Action**
   - Choose "Start a program"
   - Click "Next"
   - Program/script: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
   - Add arguments: `-ExecutionPolicy Bypass -File "C:\Users\Samuel\OneDrive\Documents\ReversCodes\run_update.ps1" -Silent`
   - Click "Next"

5. **Finish Setup**
   - Review settings
   - Check "Open the Properties dialog for this task when I click Finish"
   - Click "Finish"

6. **Configure Advanced Settings**
   - In Properties dialog, go to "General" tab
   - Check "Run with highest privileges"
   - Go to "Settings" tab
   - Check "Allow task to be run on demand"
   - Check "Run task as soon as possible after a scheduled start is missed"
   - Click "OK"

### Method 2: Using Command Line

1. **Open Command Prompt as Administrator**

2. **Create the task** (replace paths with your actual paths):
   ```cmd
   schtasks /create /tn "ReversCodes Website Update" /tr "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File \"C:\Users\Samuel\OneDrive\Documents\ReversCodes\run_update.ps1\" -Silent" /sc daily /st 09:00 /ru SYSTEM /rl HIGHEST
   ```

3. **Verify the task was created**:
   ```cmd
   schtasks /query /tn "ReversCodes Website Update"
   ```

### Method 3: Using PowerShell

1. **Open PowerShell as Administrator**

2. **Create the task**:
   ```powershell
   $action = New-ScheduledTaskAction -Execute "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"C:\Users\Samuel\OneDrive\Documents\ReversCodes\run_update.ps1`" -Silent"
   $trigger = New-ScheduledTaskTrigger -Daily -At 9AM
   $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
   $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
   
   Register-ScheduledTask -TaskName "ReversCodes Website Update" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Automatically update website content with fresh gaming data"
   ```

## Testing Your Setup

### Manual Test
1. Open Task Scheduler
2. Find your task in the list
3. Right-click and select "Run"
4. Check the results in the "History" tab

### Check Logs
After running, check these files:
- `update.log` - Detailed execution log
- `update_summary.json` - Summary of scraped content
- `powershell_update_YYYYMMDD_HHMMSS.log` - PowerShell execution log (if using -LogToFile)

## Common Issues and Solutions

### Issue: Task runs but script fails
**Solution**: Check the task's "History" tab for error details, then check `update.log`

### Issue: Permission denied
**Solution**: 
1. Right-click task → Properties → General
2. Check "Run with highest privileges"
3. Change "Run whether user is logged on or not"

### Issue: Python not found
**Solution**: 
1. Ensure Python is installed and in PATH
2. Test manually: `python --version`
3. Consider using full path to Python in the task

### Issue: Script runs but no updates
**Solution**:
1. Check `update.log` for scraping errors
2. Some websites may block automated requests
3. Verify HTML file path in script

## Advanced Configuration

### Multiple Update Times
Create multiple tasks with different triggers:
- Morning update: 9:00 AM
- Evening update: 6:00 PM
- Weekend update: Saturday 10:00 AM

### Conditional Updates
Modify the PowerShell script to check if updates are needed:
```powershell
# Add to run_update.ps1
$lastUpdate = Get-Content "update_summary.json" | ConvertFrom-Json
$hoursSinceUpdate = (Get-Date) - [DateTime]::Parse($lastUpdate.timestamp)
if ($hoursSinceUpdate.TotalHours -lt 6) {
    Write-Host "Last update was $($hoursSinceUpdate.TotalHours) hours ago. Skipping update."
    exit 0
}
```

### Email Notifications
Add email notifications for failed updates:
```powershell
# Add to run_update.ps1
if ($LASTEXITCODE -ne 0) {
    Send-MailMessage -From "noreply@yourdomain.com" -To "admin@yourdomain.com" -Subject "Website Update Failed" -Body "Check update.log for details" -SmtpServer "your-smtp-server"
}
```

## Monitoring and Maintenance

### Regular Checks
- Weekly: Review `update.log` for patterns
- Monthly: Check if all sources are still working
- Quarterly: Update script with new sources if needed

### Backup Strategy
- Keep backup of original HTML file
- Version control your script files
- Test updates on a staging site first

## Troubleshooting Commands

### Check Task Status
```cmd
schtasks /query /tn "ReversCodes Website Update" /fo list
```

### Run Task Manually
```cmd
schtasks /run /tn "ReversCodes Website Update"
```

### Delete Task
```cmd
schtasks /delete /tn "ReversCodes Website Update" /f
```

### View Task History
1. Open Task Scheduler
2. Find your task
3. Click "History" tab
4. Look for recent executions and results

## Security Considerations

- Use a dedicated user account for the task if possible
- Don't run as Administrator unless necessary
- Keep your script files secure
- Regularly update Python and dependencies
- Monitor for unusual activity in logs
