#!/usr/bin/env python3
"""
Script to remove manual ad units from all pages since user is using Google Auto Ads.
Only keeps the AdSense script in the header.
"""

import re
from pathlib import Path

def remove_manual_ads_from_game_pages():
    """Remove manual ad units from all game pages."""
    game_codes_dir = Path("ReversCodes/roblox-codes")
    
    if not game_codes_dir.exists():
        print("❌ Game codes directory not found")
        return
    
    game_files = list(game_codes_dir.glob("*.html"))
    print(f"📁 Processing {len(game_files)} game pages...")
    
    success_count = 0
    for game_file in game_files:
        try:
            with open(game_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove ad unit 1 (between about and codes)
            content = re.sub(
                r'      <!-- Ad Unit 1: Between About and Codes -->\s*'
                r'<div class="ad-container"[^>]*>.*?'
                r'<script>\s*\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);\s*</script>\s*'
                r'</div>\s*',
                '',
                content,
                flags=re.DOTALL
            )
            
            # Remove ad unit 2 (after codes section)
            content = re.sub(
                r'      <!-- Ad Unit 2: After Codes Section -->\s*'
                r'<div class="ad-container"[^>]*>.*?'
                r'<script>\s*\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);\s*</script>\s*'
                r'</div>\s*',
                '',
                content,
                flags=re.DOTALL
            )
            
            # Write back to file
            with open(game_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Removed manual ads from {game_file.name}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Error processing {game_file.name}: {str(e)}")
    
    print(f"\n📊 Summary: Removed manual ads from {success_count}/{len(game_files)} game pages")

def main():
    """Main function to remove manual ad units."""
    print("🧹 Removing manual ad units (keeping only AdSense script in headers)...")
    print("=" * 60)
    
    # Remove from game pages
    remove_manual_ads_from_game_pages()
    
    print("\n🎉 Manual ad units removed!")
    print("✅ AdSense script remains in headers for Auto Ads")
    print("✅ Google Auto Ads will automatically place ads in optimal locations")

if __name__ == "__main__":
    main()
