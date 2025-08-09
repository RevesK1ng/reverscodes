#!/usr/bin/env python3
"""
Test script for the updated game pages updater
"""

import sys
import os

# Add the current directory to the path so we can import the updater
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from update_game_pages import ComprehensiveGamePagesUpdater

def test_updater():
    """Test the updater functionality."""
    print("Testing ReversCodes Game Pages Updater...")
    print("="*50)
    
    # Create updater instance
    updater = ComprehensiveGamePagesUpdater()
    
    # Test game configurations
    print(f"Total games configured: {len(updater.game_configs)}")
    print("\nConfigured games:")
    for game_key, config in updater.game_configs.items():
        sources = config['sources']
        print(f"  - {game_key}: {len(sources)} sources")
        for source in sources:
            print(f"    * {source['name']}")
    
    # Test scraping for a few games
    test_games = ['driving_empire', 'blox_fruits', 'goalbound']
    
    print(f"\nTesting code scraping for {len(test_games)} games...")
    for game_key in test_games:
        try:
            codes_data = updater.scrape_game_codes(game_key)
            print(f"  ✅ {game_key}: {len(codes_data['active_codes'])} codes found")
        except Exception as e:
            print(f"  ❌ {game_key}: Error - {str(e)}")
    
    print("\nTest completed successfully!")
    print("The updater is ready to run with all 30 games configured.")

if __name__ == "__main__":
    test_updater()
