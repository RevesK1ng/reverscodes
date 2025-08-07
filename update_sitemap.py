"""
Sitemap Update Script for ReversCodes
Automatically updates the lastmod dates in sitemap.xml to the current date.
"""

import re
import datetime
from pathlib import Path

def update_sitemap_dates():
    """Update all lastmod dates in sitemap.xml to current date."""
    
    # Get current date in YYYY-MM-DD format
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # Path to sitemap.xml
    sitemap_path = Path("ReversCodes/sitemap.xml")
    
    if not sitemap_path.exists():
        print("❌ Error: sitemap.xml not found!")
        return False
    
    # Read the current sitemap
    try:
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading sitemap.xml: {e}")
        return False
    
    # Find all lastmod dates and replace them
    # Pattern to match: <lastmod>YYYY-MM-DD</lastmod>
    pattern = r'<lastmod>\d{4}-\d{2}-\d{2}</lastmod>'
    replacement = f'<lastmod>{current_date}</lastmod>'
    
    # Count how many dates were updated
    old_content = content
    content = re.sub(pattern, replacement, content)
    updated_count = len(re.findall(pattern, old_content))
    
    # Write the updated content back
    try:
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Successfully updated {updated_count} lastmod dates to {current_date}")
        return True
    except Exception as e:
        print(f"❌ Error writing sitemap.xml: {e}")
        return False

def validate_sitemap():
    """Basic validation of sitemap.xml structure."""
    
    sitemap_path = Path("ReversCodes/sitemap.xml")
    
    if not sitemap_path.exists():
        print("❌ sitemap.xml not found!")
        return False
    
    try:
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for required XML elements
        if '<?xml version="1.0"' not in content:
            print("❌ Missing XML declaration")
            return False
        
        if '<urlset' not in content:
            print("❌ Missing urlset element")
            return False
        
        if '</urlset>' not in content:
            print("❌ Missing closing urlset tag")
            return False
        
        # Count URLs
        url_count = content.count('<url>')
        print(f"✅ Sitemap validation passed - contains {url_count} URLs")
        return True
        
    except Exception as e:
        print(f"❌ Error validating sitemap: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Updating ReversCodes sitemap.xml...")
    print("=" * 50)
    
    # Update the dates
    if update_sitemap_dates():
        print("\n🔍 Validating sitemap structure...")
        validate_sitemap()
        
        print("\n📋 Next steps:")
        print("1. Deploy the updated sitemap.xml to your server")
        print("2. Go to Google Search Console")
        print("3. Navigate to Sitemaps section")
        print("4. Submit: sitemap.xml")
        print("5. Monitor indexing progress")
    else:
        print("\n❌ Failed to update sitemap. Please check the errors above.")
