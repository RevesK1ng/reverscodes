#!/usr/bin/env python3
"""
Improved ReversCodes Game Pages Updater
Integrates comprehensive validation to fix automation issues.
"""

import requests
import re
import json
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import random
from typing import List, Dict, Optional, Tuple
import os
from code_validator import validator
from improved_scraper import ImprovedGamingScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('improved_game_pages_update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ImprovedGamePagesUpdater:
    def __init__(self):
        self.scraper = ImprovedGamingScraper()
        self.base_path = "ReversCodes"
        
        # Updated game configuration with REAL working URLs
        self.game_configs = {
            'driving_empire': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-driving-empire-codes/', 'name': 'Beebom Driving Empire Codes'},
                    {'url': 'https://www.pockettactics.com/driving-empire/codes', 'name': 'Pocket Tactics Driving Empire Codes'}
                ]
            },
            'blox_fruits': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-blox-fruits-codes/', 'name': 'Beebom Blox Fruits Codes'},
                    {'url': 'https://progameguides.com/roblox/roblox-blox-fruits-codes/', 'name': 'Pro Game Guides Blox Fruits Codes'}
                ]
            },
            'goalbound': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-goalbound-codes/', 'name': 'Beebom Goalbound Codes'},
                    {'url': 'https://www.pocketgamer.com/roblox/goalbound-codes/', 'name': 'Pocket Gamer Goalbound Codes'}
                ]
            },
            'prospecting': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/prospecting-codes/', 'name': 'Pro Game Guides Prospecting Codes'},
                    {'url': 'https://beebom.com/roblox-prospecting-codes/', 'name': 'Beebom Prospecting Codes'}
                ]
            },
            'type_soul': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/type-soul-codes/', 'name': 'Pro Game Guides Type Soul Codes'},
                    {'url': 'https://beebom.com/roblox-type-soul-codes/', 'name': 'Beebom Type Soul Codes'}
                ]
            },
            'rivals': {
                'sources': [
                    {'url': 'https://www.videogamer.com/roblox/rivals-codes/', 'name': 'VideoGamer Rivals Codes'},
                    {'url': 'https://beebom.com/roblox-rivals-codes/', 'name': 'Beebom Rivals Codes'}
                ]
            },
            'fruit_battlegrounds': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/fruit-battlegrounds-codes/', 'name': 'Pro Game Guides Fruit Battlegrounds Codes'},
                    {'url': 'https://beebom.com/roblox-fruit-battlegrounds-codes/', 'name': 'Beebom Fruit Battlegrounds Codes'}
                ]
            },
            'anime_adventures': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-anime-adventures-codes/', 'name': 'Beebom Anime Adventures Codes'},
                    {'url': 'https://progameguides.com/roblox/anime-adventures-codes/', 'name': 'Pro Game Guides Anime Adventures Codes'}
                ]
            },
            'dress_to_impress': {
                'sources': [
                    {'url': 'https://www.ign.com/dress-to-impress-codes/', 'name': 'IGN Dress to Impress Codes'},
                    {'url': 'https://beebom.com/roblox-dress-to-impress-codes/', 'name': 'Beebom Dress to Impress Codes'}
                ]
            },
            'jujutsu_infinite': {
                'sources': [
                    {'url': 'https://www.mrguider.com/jujutsu-infinite-codes/', 'name': 'MrGuider Jujutsu Infinite Codes'},
                    {'url': 'https://beebom.com/roblox-jujutsu-infinite-codes/', 'name': 'Beebom Jujutsu Infinite Codes'}
                ]
            },
            'shindo_life': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/shindo-life-codes/', 'name': 'Pro Game Guides Shindo Life Codes'},
                    {'url': 'https://beebom.com/roblox-shindo-life-codes/', 'name': 'Beebom Shindo Life Codes'}
                ]
            },
            'project_slayers': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-project-slayers-codes/', 'name': 'Beebom Project Slayers Codes'},
                    {'url': 'https://progameguides.com/roblox/project-slayers-codes/', 'name': 'Pro Game Guides Project Slayers Codes'}
                ]
            },
            'king_legacy': {
                'sources': [
                    {'url': 'https://www.dexerto.com/roblox/king-legacy-codes/', 'name': 'Dexerto King Legacy Codes'},
                    {'url': 'https://beebom.com/roblox-king-legacy-codes/', 'name': 'Beebom King Legacy Codes'}
                ]
            },
            'anime_last_stand': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/anime-last-stand-codes/', 'name': 'Pro Game Guides Anime Last Stand Codes'},
                    {'url': 'https://beebom.com/roblox-anime-last-stand-codes/', 'name': 'Beebom Anime Last Stand Codes'}
                ]
            },
            'sakura_stand': {
                'sources': [
                    {'url': 'https://www.bluestacks.com/sakura-stand-codes/', 'name': 'Bluestacks Sakura Stand Codes'},
                    {'url': 'https://beebom.com/roblox-sakura-stand-codes/', 'name': 'Beebom Sakura Stand Codes'}
                ]
            },
            'blade_ball': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-blade-ball-codes/', 'name': 'Beebom Blade Ball Codes'},
                    {'url': 'https://progameguides.com/roblox/blade-ball-codes/', 'name': 'Pro Game Guides Blade Ball Codes'}
                ]
            },
            'fruit_warriors': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/fruit-warriors-codes/', 'name': 'Pro Game Guides Fruit Warriors Codes'},
                    {'url': 'https://beebom.com/roblox-fruit-warriors-codes/', 'name': 'Beebom Fruit Warriors Codes'}
                ]
            },
            'grow_a_garden': {
                'sources': [
                    {'url': 'https://www.pcgamesn.com/grow-a-garden-codes/', 'name': 'PCGamesN Grow a Garden Codes'},
                    {'url': 'https://beebom.com/roblox-grow-a-garden-codes/', 'name': 'Beebom Grow a Garden Codes'}
                ]
            },
            'anime_vanguards': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-anime-vanguards-codes/', 'name': 'Beebom Anime Vanguards Codes'},
                    {'url': 'https://progameguides.com/roblox/anime-vanguards-codes/', 'name': 'Pro Game Guides Anime Vanguards Codes'}
                ]
            },
            'tower_defense_simulator': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/tower-defense-simulator-codes/', 'name': 'Pro Game Guides TDS Codes'},
                    {'url': 'https://beebom.com/roblox-tower-defense-simulator-codes/', 'name': 'Beebom TDS Codes'}
                ]
            },
            'spongebob_tower_defense': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-spongebob-tower-defense-codes/', 'name': 'Beebom SpongeBob TD Codes'},
                    {'url': 'https://progameguides.com/roblox/spongebob-tower-defense-codes/', 'name': 'Pro Game Guides SpongeBob TD Codes'}
                ]
            },
            'project_egoist': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-project-egoist-codes/', 'name': 'Beebom Project Egoist Codes'},
                    {'url': 'https://progameguides.com/roblox/project-egoist-codes/', 'name': 'Pro Game Guides Project Egoist Codes'}
                ]
            },
            'blue_lock_rivals': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-blue-lock-rivals-codes/', 'name': 'Beebom Blue Lock Rivals Codes'},
                    {'url': 'https://progameguides.com/roblox/blue-lock-rivals-codes/', 'name': 'Pro Game Guides Blue Lock Rivals Codes'}
                ]
            },
            'jujutsu_shenanigans': {
                'sources': [
                    {'url': 'https://www.mrguider.com/jujutsu-shenanigans-codes/', 'name': 'MrGuider Jujutsu Shenanigans Codes'},
                    {'url': 'https://beebom.com/roblox-jujutsu-shenanigans-codes/', 'name': 'Beebom Jujutsu Shenanigans Codes'}
                ]
            },
            'combat_warriors': {
                'sources': [
                    {'url': 'https://twinfinite.net/roblox/combat-warriors-codes/', 'name': 'Twinfinite Combat Warriors Codes'},
                    {'url': 'https://beebom.com/roblox-combat-warriors-codes/', 'name': 'Beebom Combat Warriors Codes'}
                ]
            },
            'anime_rangers_x': {
                'sources': [
                    {'url': 'https://www.videogamer.com/roblox/anime-rangers-x-codes/', 'name': 'VideoGamer Anime Rangers X Codes'},
                    {'url': 'https://beebom.com/roblox-anime-rangers-x-codes/', 'name': 'Beebom Anime Rangers X Codes'}
                ]
            },
            'basketball_zero': {
                'sources': [
                    {'url': 'https://www.khelnow.com/roblox/basketball-zero-codes/', 'name': 'Khel Now Basketball Zero Codes'},
                    {'url': 'https://beebom.com/roblox-basketball-zero-codes/', 'name': 'Beebom Basketball Zero Codes'}
                ]
            },
            'volleyball_legends': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/volleyball-legends-codes/', 'name': 'Pro Game Guides Volleyball Legends Codes'},
                    {'url': 'https://beebom.com/roblox-volleyball-legends-codes/', 'name': 'Beebom Volleyball Legends Codes'}
                ]
            },
            'arise_crossover': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-arise-crossover-codes/', 'name': 'Beebom Arise Crossover Codes'},
                    {'url': 'https://progameguides.com/roblox/arise-crossover-codes/', 'name': 'Pro Game Guides Arise Crossover Codes'}
                ]
            }
        }

    def scrape_game_codes_improved(self, game_key: str) -> Dict:
        """Improved method to scrape codes with comprehensive validation."""
        if game_key not in self.game_configs:
            logger.error(f"No configuration found for game: {game_key}")
            return {'active_codes': [], 'expired_codes': [], 'validation_stats': {}}
        
        config = self.game_configs[game_key]
        
        # Use the improved scraper with validation
        result = self.scraper.scrape_with_fallback(game_key, config['sources'])
        
        # Add validation statistics
        if 'validation_stats' not in result:
            result['validation_stats'] = {
                'total_scraped': len(result.get('active_codes', [])),
                'valid_codes': len(result.get('active_codes', [])),
                'quality_codes': len(result.get('active_codes', [])),
                'duplicates_removed': 0
            }
        
        return result

    def update_game_page(self, game_key: str, codes_data: Dict) -> bool:
        """Update game page with validated codes."""
        try:
            # Map game keys to file paths
            file_paths = {
                'driving_empire': f"{self.base_path}/roblox-codes/driving-empire.html",
                'blox_fruits': f"{self.base_path}/roblox-codes/blox-fruits.html",
                'goalbound': f"{self.base_path}/roblox-codes/goalbound.html",
                'prospecting': f"{self.base_path}/roblox-codes/prospecting.html",
                'type_soul': f"{self.base_path}/roblox-codes/type-soul.html",
                'rivals': f"{self.base_path}/roblox-codes/rivals.html",
                'fruit_battlegrounds': f"{self.base_path}/roblox-codes/fruitbattlegrounds.html",
                'anime_adventures': f"{self.base_path}/roblox-codes/animeadventures.html",
                'dress_to_impress': f"{self.base_path}/roblox-codes/dress-to-impress.html",
                'jujutsu_infinite': f"{self.base_path}/roblox-codes/jujutsu-infinite.html",
                'shindo_life': f"{self.base_path}/roblox-codes/shindo-life.html",
                'project_slayers': f"{self.base_path}/roblox-codes/project-slayers.html",
                'king_legacy': f"{self.base_path}/roblox-codes/king-legacy.html",
                'anime_last_stand': f"{self.base_path}/roblox-codes/anime-last-stand.html",
                'sakura_stand': f"{self.base_path}/roblox-codes/sakura-stand.html",
                'blade_ball': f"{self.base_path}/roblox-codes/blade-ball.html",
                'fruit_warriors': f"{self.base_path}/roblox-codes/fruit-warriors.html",
                'grow_a_garden': f"{self.base_path}/roblox-codes/grow-a-garden.html",
                'anime_vanguards': f"{self.base_path}/roblox-codes/anime-vanguards.html",
                'tower_defense_simulator': f"{self.base_path}/roblox-codes/tower-defense-simulator.html",
                'spongebob_tower_defense': f"{self.base_path}/roblox-codes/spongebob-tower-defense.html",
                'project_egoist': f"{self.base_path}/roblox-codes/project-egoist.html",
                'blue_lock_rivals': f"{self.base_path}/roblox-codes/blue-lock-rivals.html",
                'jujutsu_shenanigans': f"{self.base_path}/roblox-codes/jujutsu-shenanigans.html",
                'combat_warriors': f"{self.base_path}/roblox-codes/combat-warriors.html",
                'anime_rangers_x': f"{self.base_path}/roblox-codes/anime-rangers-x.html",
                'basketball_zero': f"{self.base_path}/roblox-codes/basketball-zero.html",
                'volleyball_legends': f"{self.base_path}/roblox-codes/volleyball-legends.html",
                'arise_crossover': f"{self.base_path}/roblox-codes/arise-crossover.html"
            }
            
            file_path = file_paths.get(game_key)
            if not file_path or not os.path.exists(file_path):
                logger.warning(f"File not found for game {game_key}: {file_path}")
                return False
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update the date in the lastUpdatedDate span
            current_date = datetime.now().strftime('%B %d, %Y')
            content = re.sub(
                r'<span id="lastUpdatedDate">[^<]*</span>',
                f'<span id="lastUpdatedDate">{current_date}</span>',
                content
            )
            
            # Update the date in the lastUpdated span
            content = re.sub(
                r'<span id="lastUpdated">[^<]*</span>',
                f'<span id="lastUpdated">{current_date}</span>',
                content
            )
            
            # Update the expired date span
            content = re.sub(
                r'<span id="expiredDate">[^<]*</span>',
                f'<span id="expiredDate">{current_date}</span>',
                content
            )
            
            # Update the active codes section with validated codes
            active_codes_html = ''
            for code in codes_data.get('active_codes', []):
                safe_code = re.sub(r'["<>]', '', code["code"])  # basic safety
                safe_reward = re.sub(r'["<>]', '', code.get("reward", "Free Rewards"))
                active_codes_html += (
                    '          <li class="code-item">\n'
                    f'            <span class="code">{safe_code}</span>\n'
                    f'            <span class="reward">{safe_reward}</span>\n'
                    f'            <button class="copy-btn" onclick="copyCode(\'{safe_code}\')">Copy</button>\n'
                    '          </li>\n'
                )
            
            # Replace the active codes list
            new_active_ul = f'<ul id="activeCodesList" class="codes-list">\n{active_codes_html}        </ul>'
            replaced = re.sub(r'<ul[^>]*id="activeCodesList"[^>]*class="codes-list"[^>]*>.*?</ul>', new_active_ul, content, flags=re.DOTALL)
            if replaced == content:
                # fallback: the list might miss id but inside section with id="active-codes"
                replaced = re.sub(
                    r'(<section[^>]*id="active-codes"[^>]*>[\s\S]*?<ul[^>]*class="codes-list"[^>]*>)[\s\S]*?(</ul>)',
                    lambda m: m.group(1) + "\n" + active_codes_html + "        " + m.group(2),
                    content,
                    count=1
                )
            content = replaced
            
            # Update expired codes (if any)
            expired_codes_html = ''
            for ex_code in codes_data.get('expired_codes', []):
                safe_ex = re.sub(r'["<>]', '', ex_code)
                expired_codes_html += (
                    '          <li class="code-item expired">\n'
                    f'            <span class="code">{safe_ex}</span>\n'
                    '            <span class="reward">Expired</span>\n'
                    '            <button class="copy-btn" disabled>Expired</button>\n'
                    '          </li>\n'
                )
            
            # Replace the expired codes list
            new_exp_ul = f'<ul id="expiredCodesList" class="codes-list">\n{expired_codes_html}        </ul>'
            replaced_exp = re.sub(r'<ul[^>]*id="expiredCodesList"[^>]*class="codes-list"[^>]*>.*?</ul>', new_exp_ul, content, flags=re.DOTALL)
            if replaced_exp == content:
                replaced_exp = re.sub(
                    r'(<section[^>]*id="expired-codes"[^>]*>[\s\S]*?<ul[^>]*class="codes-list"[^>]*>)[\s\S]*?(</ul>)',
                    lambda m: m.group(1) + "\n" + expired_codes_html + "        " + m.group(2),
                    content,
                    count=1
                )
            content = replaced_exp
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Successfully updated {file_path} with {len(codes_data.get('active_codes', []))} validated codes")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update {game_key} page: {str(e)}")
            return False

    def run_update(self):
        """Main method to run the improved update process."""
        logger.info("Starting improved game pages update with validation...")
        
        try:
            # List of all games to update
            all_games = [
                'driving_empire',
                'blox_fruits',
                'goalbound',
                'prospecting',
                'type_soul',
                'rivals',
                'fruit_battlegrounds',
                'anime_adventures',
                'dress_to_impress',
                'jujutsu_infinite',
                'shindo_life',
                'project_slayers',
                'king_legacy',
                'anime_last_stand',
                'sakura_stand',
                'blade_ball',
                'fruit_warriors',
                'grow_a_garden',
                'anime_vanguards',
                'tower_defense_simulator',
                'spongebob_tower_defense',
                'project_egoist',
                'blue_lock_rivals',
                'jujutsu_shenanigans',
                'combat_warriors',
                'anime_rangers_x',
                'basketball_zero',
                'volleyball_legends',
                'arise_crossover'
            ]
            
            # Scrape and update codes for all games
            logger.info("Scraping and updating codes for all games with validation...")
            game_results = {}
            
            for game_key in all_games:
                try:
                    logger.info(f"Processing {game_key} with improved validation...")
                    codes_data = self.scrape_game_codes_improved(game_key)
                    success = self.update_game_page(game_key, codes_data)
                    
                    validation_stats = codes_data.get('validation_stats', {})
                    game_results[game_key] = {
                        'success': success,
                        'codes_count': len(codes_data.get('active_codes', [])),
                        'total_scraped': validation_stats.get('total_scraped', 0),
                        'valid_codes': validation_stats.get('valid_codes', 0),
                        'quality_codes': validation_stats.get('quality_codes', 0),
                        'duplicates_removed': validation_stats.get('duplicates_removed', 0),
                        'source': self.game_configs.get(game_key, {}).get('sources', [{}])[0].get('name', 'Unknown')
                    }
                    
                    logger.info(f"Completed {game_key}: {len(codes_data.get('active_codes', []))} quality codes from {game_results[game_key]['source']}")
                    
                except Exception as e:
                    logger.error(f"Failed to process {game_key}: {str(e)}")
                    game_results[game_key] = {
                        'success': False,
                        'codes_count': 0,
                        'total_scraped': 0,
                        'valid_codes': 0,
                        'quality_codes': 0,
                        'duplicates_removed': 0,
                        'source': 'Error'
                    }
            
            # Calculate summary statistics
            total_codes = sum(result['codes_count'] for result in game_results.values())
            successful_updates = sum(1 for result in game_results.values() if result['success'])
            total_scraped = sum(result['total_scraped'] for result in game_results.values())
            total_valid = sum(result['valid_codes'] for result in game_results.values())
            total_quality = sum(result['quality_codes'] for result in game_results.values())
            total_duplicates_removed = sum(result['duplicates_removed'] for result in game_results.values())
            
            # Log summary
            summary = {
                'timestamp': datetime.now().isoformat(),
                'total_games_processed': len(all_games),
                'successful_updates': successful_updates,
                'total_codes_found': total_codes,
                'total_scraped': total_scraped,
                'total_valid_codes': total_valid,
                'total_quality_codes': total_quality,
                'total_duplicates_removed': total_duplicates_removed,
                'game_results': game_results,
                'status': 'success'
            }
            
            with open('improved_game_pages_update_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info(f"Improved game pages update completed successfully!")
            logger.info(f"Processed {len(all_games)} games, {successful_updates} successful updates")
            logger.info(f"Total codes: {total_codes}, Valid: {total_valid}, Quality: {total_quality}")
            logger.info(f"Duplicates removed: {total_duplicates_removed}")
            
            # Print detailed results
            print("\n" + "="*100)
            print("IMPROVED GAME UPDATE SUMMARY WITH VALIDATION")
            print("="*100)
            for game_key, result in game_results.items():
                status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
                print(f"{game_key.replace('_', ' ').title():<25} | {status:<12} | {result['codes_count']:>3} codes | {result['source']}")
                if result['duplicates_removed'] > 0:
                    print(f"{'':<25} | {'':<12} | Duplicates removed: {result['duplicates_removed']}")
            print("="*100)
            
        except Exception as e:
            logger.error(f"Update process failed: {str(e)}")
            raise

def main():
    """Main function to run the improved updater."""
    updater = ImprovedGamePagesUpdater()
    updater.run_update()

if __name__ == "__main__":
    main()
