#!/usr/bin/env python3
"""
Script to add Google AdSense to all game pages and the game gallery page.
"""

import os
import re
from pathlib import Path

# AdSense configuration
ADSENSE_PUBLISHER_ID = "ca-pub-9521802974687428"
ADSENSE_SCRIPT = f'''    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE_PUBLISHER_ID}"
     crossorigin="anonymous"></script>
'''

# Ad unit templates
AD_UNIT_1 = '''      <!-- Ad Unit 1: Between About and Codes -->
      <div class="ad-container" style="text-align: center; margin: 20px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-9521802974687428"
             data-ad-slot="1111111111"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
'''

AD_UNIT_2 = '''      <!-- Ad Unit 2: After Codes Section -->
      <div class="ad-container" style="text-align: center; margin: 20px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-9521802974687428"
             data-ad-slot="2222222222"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
'''

def add_adsense_to_game_page(file_path):
    """Add AdSense to a game page."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if AdSense is already added
        if 'adsbygoogle' in content:
            print(f"✅ AdSense already present in {file_path}")
            return False
        
        # Add AdSense script after stylesheet link
        content = re.sub(
            r'(<link rel="stylesheet" href="../style\.css">)',
            r'\1\n\n' + ADSENSE_SCRIPT,
            content
        )
        
        # Add first ad unit between about and codes sections
        content = re.sub(
            r'(      </section>\n\n      <!-- Active Codes -->)',
            r'\1\n' + AD_UNIT_1,
            content
        )
        
        # Add second ad unit after codes section
        content = re.sub(
            r'(        </ul>\n      </section>\n\n      <!-- How to Redeem -->)',
            r'\1\n' + AD_UNIT_2,
            content
        )
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Added AdSense to {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")
        return False

def add_adsense_to_gallery_page(file_path):
    """Add AdSense to the game gallery page."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if AdSense is already added
        if 'adsbygoogle' in content:
            print(f"✅ AdSense already present in {file_path}")
            return False
        
        # Add AdSense script after stylesheet link
        content = re.sub(
            r'(<link rel="stylesheet" href="style\.css">)',
            r'\1\n\n' + ADSENSE_SCRIPT,
            content
        )
        
        # Add ad units around the games gallery
        gallery_ad_1 = '''                    <!-- Ad Unit 1: Top Banner -->
                    <div class="ad-container" style="text-align: center; margin: 20px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                        <ins class="adsbygoogle"
                             style="display:block"
                             data-ad-client="ca-pub-9521802974687428"
                             data-ad-slot="1234567890"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                        <script>
                             (adsbygoogle = window.adsbygoogle || []).push({});
                        </script>
                    </div>
'''
        
        gallery_ad_2 = '''                    <!-- Ad Unit 2: Bottom Banner -->
                    <div class="ad-container" style="text-align: center; margin: 20px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                        <ins class="adsbygoogle"
                             style="display:block"
                             data-ad-client="ca-pub-9521802974687428"
                             data-ad-slot="0987654321"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                        <script>
                             (adsbygoogle = window.adsbygoogle || []).push({});
                        </script>
                    </div>
'''
        
        # Add first ad unit before games gallery
        content = re.sub(
            r'(                    <div class="games-gallery" id="gamesGallery" role="list">)',
            gallery_ad_1 + r'\1',
            content
        )
        
        # Add second ad unit after games gallery
        content = re.sub(
            r'(                    </div>\n                </div>\n            </section>)',
            r'\1\n' + gallery_ad_2,
            content
        )
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Added AdSense to {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")
        return False

def main():
    """Main function to add AdSense to all pages."""
    print("🚀 Adding Google AdSense to all pages...")
    print("=" * 50)
    
    # Get the ReversCodes directory
    reverscodes_dir = Path("ReversCodes")
    game_codes_dir = reverscodes_dir / "roblox-codes"
    
    # Add AdSense to game gallery page
    gallery_page = reverscodes_dir / "game-gallery.html"
    if gallery_page.exists():
        add_adsense_to_gallery_page(gallery_page)
    else:
        print(f"❌ Game gallery page not found: {gallery_page}")
    
    # Add AdSense to all game pages
    if game_codes_dir.exists():
        game_files = list(game_codes_dir.glob("*.html"))
        print(f"\n📁 Found {len(game_files)} game pages to process:")
        
        success_count = 0
        for game_file in game_files:
            if add_adsense_to_game_page(game_file):
                success_count += 1
        
        print(f"\n📊 Summary:")
        print(f"✅ Successfully processed: {success_count} pages")
        print(f"❌ Failed: {len(game_files) - success_count} pages")
    else:
        print(f"❌ Game codes directory not found: {game_codes_dir}")
    
    print("\n🎉 AdSense integration complete!")
    print("\n📝 Next steps:")
    print("1. Create ad units in your Google AdSense dashboard")
    print("2. Replace the placeholder ad-slot IDs with real ones:")
    print("   - 1234567890 (Gallery Top)")
    print("   - 0987654321 (Gallery Bottom)")
    print("   - 1111111111 (Game Pages - Between About/Codes)")
    print("   - 2222222222 (Game Pages - After Codes)")
    print("3. Test the pages to ensure ads are displaying correctly")

if __name__ == "__main__":
    main()
