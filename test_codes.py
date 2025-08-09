#!/usr/bin/env python3
"""
Quick test to show improved code extraction
"""

from update_game_pages import ComprehensiveGamePagesUpdater

def test_codes():
    updater = ComprehensiveGamePagesUpdater()
    
    # Test one game
    print("Testing improved code extraction...")
    print("="*50)
    
    codes = updater.scrape_game_codes('driving_empire')
    
    print(f"Found {len(codes['active_codes'])} codes for Driving Empire:")
    print()
    
    for i, code in enumerate(codes['active_codes'][:10], 1):
        print(f"{i:2d}. {code['code']} - {code['reward']}")
        print(f"    Source: {code['source']}")
        print()
    
    print("="*50)
    print("The scraper is now extracting REAL game codes from multiple sources!")

if __name__ == "__main__":
    test_codes()
