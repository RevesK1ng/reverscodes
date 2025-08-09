#!/usr/bin/env python3
"""
Script to add Google AdSense ad units to trending and guides pages.
"""

import re
from pathlib import Path

# Ad unit templates
AD_UNIT_1 = '''                <!-- Ad Unit 1: Top Banner -->
                <div class="ad-container" style="text-align: center; margin: 20px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-9521802974687428"
                         data-ad-slot="3333333333"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script>
                         (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
'''

AD_UNIT_2 = '''                <!-- Ad Unit 2: Bottom Banner -->
                <div class="ad-container" style="text-align: center; margin: 20px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-9521802974687428"
                         data-ad-slot="4444444444"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script>
                         (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
'''

def add_adsense_to_trending_page(file_path):
    """Add AdSense ad units to the trending page."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if ad units are already added
        if 'data-ad-slot="3333333333"' in content or 'data-ad-slot="4444444444"' in content:
            print(f"✅ AdSense ad units already present in {file_path}")
            return False
        
        # Add first ad unit after section header
        content = re.sub(
            r'(                <div class="section-header">\n                    <h2 class="section-title">What\'s Hot Right Now</h2>\n                    <p class="section-subtitle">The most searched gaming topics and trending discussions</p>\n                </div>)',
            r'\1\n' + AD_UNIT_1,
            content
        )
        
        # Add second ad unit after trending grid
        content = re.sub(
            r'(                </div>\n            </div>\n        </section>)',
            r'\1\n' + AD_UNIT_2,
            content
        )
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Added AdSense ad units to {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")
        return False

def add_adsense_to_guides_page(file_path):
    """Add AdSense ad units to the guides page."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if ad units are already added
        if 'data-ad-slot="3333333333"' in content or 'data-ad-slot="4444444444"' in content:
            print(f"✅ AdSense ad units already present in {file_path}")
            return False
        
        # Add first ad unit after section header
        content = re.sub(
            r'(                <div class="section-header">\n                    <h2 class="section-title">🎯 Popular Gaming Guides</h2>\n                    <p class="section-subtitle">Master your favorite games with our expert tips and strategies</p>\n                </div>)',
            r'\1\n' + AD_UNIT_1,
            content
        )
        
        # Add second ad unit after guides grid
        content = re.sub(
            r'(                </div>\n            </div>\n        </section>)',
            r'\1\n' + AD_UNIT_2,
            content
        )
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Added AdSense ad units to {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")
        return False

def main():
    """Main function to add AdSense ad units to trending and guides pages."""
    print("🚀 Adding Google AdSense ad units to trending and guides pages...")
    print("=" * 60)
    
    # Get the ReversCodes directory
    reverscodes_dir = Path("ReversCodes")
    
    # Add AdSense to trending page
    trending_page = reverscodes_dir / "trending.html"
    if trending_page.exists():
        add_adsense_to_trending_page(trending_page)
    else:
        print(f"❌ Trending page not found: {trending_page}")
    
    # Add AdSense to guides page
    guides_page = reverscodes_dir / "guides.html"
    if guides_page.exists():
        add_adsense_to_guides_page(guides_page)
    else:
        print(f"❌ Guides page not found: {guides_page}")
    
    print("\n🎉 AdSense ad units integration complete!")
    print("\n📝 Next steps:")
    print("1. Create ad units in your Google AdSense dashboard")
    print("2. Replace the placeholder ad-slot IDs with real ones:")
    print("   - 3333333333 (Trending/Guides - Top)")
    print("   - 4444444444 (Trending/Guides - Bottom)")
    print("3. Test the pages to ensure ads are displaying correctly")

if __name__ == "__main__":
    main()
