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
from enhanced_precise_scraper import enhanced_scraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('precise_game_pages_update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PreciseGamePagesUpdater:
    def __init__(self):
        self.scraper = enhanced_scraper
        self.base_path = "ReversCodes"
        
        # Updated game configuration with REAL working URLs
        self.game_configs = {
            'driving_empire': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-driving-empire-codes/', 'name': 'Beebom Driving Empire Codes'},
                    {'url': 'https://www.pockettactics.com/driving-empire/codes', 'name': 'Pocket Tactics Driving Empire Codes'}
                ]
            },
            'all_star_tower_defense_x': {
                'sources': [
                    {'url': 'https://beebom.com/all-star-tower-defense-codes/', 'name': 'Beebom All Star Tower Defense X Codes'},
                    {'url': 'https://www.pockettactics.com/all-star-tower-defense-x-codes', 'name': 'Pocket Tactics All Star Tower Defense X Codes'}
                ]
            },
            'blox_fruits': {
                'sources': [
                    {'url': 'https://www.pcgamesn.com/blox-fruits/codes', 'name': 'PCGamesN Blox Fruits Codes'},
                    {'url': 'https://www.pcgamer.com/games/roblox/blox-fruits-codes/', 'name': 'PC Gamer Blox Fruits Codes'}
                ]
            },
            'goalbound': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/goalbound-codes', 'name': 'Pocket Tactics Goalbound Codes'},
                    {'url': 'https://www.pcgamesn.com/goalbound/codes', 'name': 'PCGamesN Goalbound Codes'}
                ]
            },
            'prospecting': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/prospecting-codes', 'name': 'Pocket Tactics Prospecting Codes'},
                    {'url': 'https://beebom.com/roblox-prospecting-codes/', 'name': 'Beebom Prospecting Codes'}
                ]
            },
            'type_soul': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/type-soul/codes', 'name': 'Pocket Tactics Type Soul Codes'},
                    {'url': 'https://beebom.com/roblox-type-soul-codes/', 'name': 'Beebom Type Soul Codes'}
                ]
            },
            'rivals': {
                'sources': [
                    {'url': 'https://www.pcgamesn.com/rivals/codes', 'name': 'PCGamesN Rivals Codes'},
                    {'url': 'https://beebom.com/roblox-rivals-codes/', 'name': 'Beebom Rivals Codes'}
                ]
            },
            'fruit_battlegrounds': {
                'sources': [
                    {'url': 'https://www.pcgamer.com/games/sim/roblox-fruit-battlegrounds-codes/', 'name': 'PC Gamer Fruit Battlegrounds Codes'},
                    {'url': 'https://www.pockettactics.com/fruit-battlegrounds/codes/', 'name': 'Pocket Tactics Fruit Battlegrounds Codes'}
                ]
            },
            'anime_adventures': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/anime-adventures/codes', 'name': 'Pocket Tactics Anime Adventures Codes'},
                    {'url': 'https://progameguides.com/roblox/anime-adventures-codes/', 'name': 'Pro Game Guides Anime Adventures Codes'}
                ]
            },
            'dress_to_impress': {
                'sources': [
                    {'url': 'https://www.pcgamer.com/games/roblox/dress-to-impress-codes/', 'name': 'PC Gamer Dress to Impress Codes'},
                    {'url': 'https://beebom.com/roblox-dress-to-impress-codes/', 'name': 'Beebom Dress to Impress Codes'}
                ]
            },
            'jujutsu_infinite': {
                'sources': [
                    {'url': 'https://www.pcgamer.com/games/action/roblox-jujutsu-infinite-codes/', 'name': 'PC Gamer Jujutsu Infinite Codes'},
                    {'url': 'https://www.pocketgamer.com/roblox/jujutsu-infinite-codes/', 'name': 'Pocket Gamer Jujutsu Infinite Codes'}
                ]
            },
            'shindo_life': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/shindo-life/codes', 'name': 'Pocket Tactics Shindo Life Codes'},
                    {'url': 'https://beebom.com/roblox-shindo-life-codes/', 'name': 'Beebom Shindo Life Codes'}
                ]
            },
            'project_slayers': {
                'sources': [
                    {'url': 'https://beebom.com/project-slayers-codes/', 'name': 'Beebom Project Slayers Codes'},
                    {'url': 'https://progameguides.com/roblox/project-slayers-codes/', 'name': 'Pro Game Guides Project Slayers Codes'}
                ]
            },
            'king_legacy': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/roblox-king-legacy-codes/', 'name': 'Pro Game Guides King Legacy Codes'},
                    {'url': 'https://beebom.com/roblox-king-legacy-codes/', 'name': 'Beebom King Legacy Codes'}
                ]
            },
            'anime_last_stand': {
                'sources': [
                    {'url': 'https://beebom.com/anime-last-stand-codes/', 'name': 'Beebom Anime Last Stand Codes'},
                    {'url': 'https://www.pcgamesn.com/anime-last-stand/codes', 'name': 'PCGamesN Anime Last Stand Codes'}
                ]
            },
            'sakura_stand': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/sakura-stand/codes', 'name': 'Pocket Tactics Sakura Stand Codes'},
                    {'url': 'https://beebom.com/roblox-sakura-stand-codes/', 'name': 'Beebom Sakura Stand Codes'}
                ]
            },
            'blade_ball': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/blade-ball/codes', 'name': 'Pocket Tactics Blade Ball Codes'},
                    {'url': 'https://www.pcgamesn.com/blade-ball/codes', 'name': 'PCGamesN Blade Ball Codes'}
                ]
            },
            'fruit_warriors': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/roblox-fruit-warriors-codes/', 'name': 'Pro Game Guides Fruit Warriors Codes'},
                    {'url': 'https://holdtoreset.com/fruit-warriors-codes/', 'name': 'Hold to Reset Fruit Warriors Codes'}
                ]
            },
            'grow_a_garden': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-grow-a-garden-codes/', 'name': 'Beebom Grow a Garden Codes'},
                    {'url': 'https://www.pcgamesn.com/grow-a-garden', 'name': 'PCGamesN Grow a Garden Codes'}
                ]
            },
            'anime_vanguards': {
                'sources': [
                    {'url': 'https://beebom.com/anime-vanguards-codes/', 'name': 'Beebom Anime Vanguards Codes'},
                    {'url': 'https://www.pockettactics.com/anime-vanguards/codes', 'name': 'Pocket Tactics Anime Vanguards Codes'}
                ]
            },
            'tower_defense_simulator': {
                'sources': [
                    {'url': 'https://progameguides.com/roblox/tower-defense-simulator-codes-list/', 'name': 'Pro Game Guides Tower Defense Simulator Codes'},
                    {'url': 'https://beebom.com/tower-defense-simulator-tds-codes/', 'name': 'Beebom Tower Defense Simulator Codes'}
                ]
            },
            'spongebob_tower_defense': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/spongebob-tower-defense/codes', 'name': 'Pocket Tactics SpongeBob Tower Defense Codes'},
                    {'url': 'https://progameguides.com/roblox/spongebob-tower-defense-codes/', 'name': 'Pro Game Guides SpongeBob Tower Defense Codes'}
                ]
            },
            'project_egoist': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/project-egoist-codes', 'name': 'Pocket Tactics Project Egoist Codes'},
                    {'url': 'https://beebom.com/project-egoist-codes/', 'name': 'Beebom Project Egoist Codes'}
                ]
            },
            'blue_lock_rivals': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/blue-lock-rivals/codes', 'name': 'Pocket Tactics Blue Lock Rivals Codes'},
                    {'url': 'https://beebom.com/blue-lock-rivals-codes/', 'name': 'Beebom Blue Lock Rivals Codes'}
                ]
            },
            'jujutsu_shenanigans': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/jujutsu-shenanigans/codes', 'name': 'Pocket Tactics Jujutsu Shenanigans Codes'},
                    {'url': 'https://www.pcgamesn.com/jujutsu-shenanigans/codes', 'name': 'PCGamesN Jujutsu Shenanigans Codes'}
                ]
            },
            'combat_warriors': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/combat-warriors/codes', 'name': 'Pocket Tactics Combat Warriors Codes'},
                    {'url': 'https://twinfinite.net/roblox/combat-warriors-codes/', 'name': 'Twinfinite Combat Warriors Codes'}
                ]
            },
            'anime_rangers_x': {
                'sources': [
                    {'url': 'https://www.videogamer.com/guides/anime-rangers-x-codes/', 'name': 'VideoGamer Anime Rangers X Codes'},
                    {'url': 'https://www.pockettactics.com/anime-rangers-x-codes', 'name': 'Pocket Tactics Anime Rangers X Codes'}
                ]
            },
            'basketball_zero': {
                'sources': [
                    {'url': 'https://khelnow.com/gaming/latest-roblox-basketball-zero-codes-august-202508', 'name': 'KhelNow Basketball Zero Codes'},
                    {'url': 'https://www.pockettactics.com/basketball-zero-codes', 'name': 'Pocket Tactics Basketball Zero Codes'}
                ]
            },
            'volleyball_legends': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/haikyuu-legends-codes/', 'name': 'Pocket Tactics Volleyball Legends Codes'},
                    {'url': 'https://progameguides.com/roblox/haikyuu-legends-codes/', 'name': 'Pro Game Guides Volleyball Legends Codes'}
                ]
            },
            'arise_crossover': {
                'sources': [
                    {'url': 'https://www.pockettactics.com/arise-crossover-codes', 'name': 'Pocket Tactics Arise Crossover Codes'},
                    {'url': 'https://beebom.com/arise-crossover-codes/', 'name': 'Beebom Arise Crossover Codes'}
                ]
            }
        }

    def scrape_game_codes_precise(self, game_key: str) -> Dict:
        """Precise method to scrape codes with section anchor detection and confidence scoring."""
        if game_key not in self.game_configs:
            logger.error(f"No configuration found for game: {game_key}")
            return {'active_codes': [], 'expired_codes': [], 'extraction_stats': {}}
        
        config = self.game_configs[game_key]
        
        # Use the precise scraper with enhanced extraction
        result = self.scraper.scrape_game_codes_precise(game_key, config['sources'])
        
        # Log detailed scraping summary
        self.scraper.log_scraping_summary(game_key, result)
        
        # Add quality analysis
        quality_analysis = self.scraper.analyze_extraction_quality(result)
        result['quality_analysis'] = quality_analysis
        
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
                safe_code = re.sub(r'["<>]', '', ex_code.get('code', ''))
                safe_reward = re.sub(r'["<>]', '', ex_code.get('reward', 'Expired'))
                expired_codes_html += (
                    '          <li class="code-item expired">\n'
                    f'            <span class="code">{safe_code}</span>\n'
                    f'            <span class="reward">{safe_reward}</span>\n'
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
        logger.info("Starting precise game pages update with section anchor detection...")
        
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
            logger.info("Scraping and updating codes for all games with precise extraction...")
            game_results = {}
            
            for game_key in all_games:
                try:
                    logger.info(f"Processing {game_key} with precise extraction...")
                    codes_data = self.scrape_game_codes_precise(game_key)
                    success = self.update_game_page(game_key, codes_data)
                    
                    extraction_stats = codes_data.get('extraction_stats', {})
                    quality_analysis = codes_data.get('quality_analysis', {})
                    game_results[game_key] = {
                        'success': success,
                        'codes_count': len(codes_data.get('active_codes', [])),
                        'total_active_found': extraction_stats.get('total_active_found', 0),
                        'total_expired_found': extraction_stats.get('total_expired_found', 0),
                        'filtered_active': extraction_stats.get('filtered_active', 0),
                        'quality_score': quality_analysis.get('quality_score', 0.0),
                        'high_confidence_codes': quality_analysis.get('high_confidence_codes', 0),
                        'medium_confidence_codes': quality_analysis.get('medium_confidence_codes', 0),
                        'source': self.game_configs.get(game_key, {}).get('sources', [{}])[0].get('name', 'Unknown')
                    }
                    
                    logger.info(f"Completed {game_key}: {len(codes_data.get('active_codes', []))} precise codes (quality: {quality_analysis.get('quality_score', 0.0):.2f}) from {game_results[game_key]['source']}")
                    
                except Exception as e:
                    logger.error(f"Failed to process {game_key}: {str(e)}")
                    game_results[game_key] = {
                        'success': False,
                        'codes_count': 0,
                        'total_active_found': 0,
                        'total_expired_found': 0,
                        'filtered_active': 0,
                        'quality_score': 0.0,
                        'high_confidence_codes': 0,
                        'medium_confidence_codes': 0,
                        'source': 'Error'
                    }
            
            # Calculate summary statistics
            total_codes = sum(result['codes_count'] for result in game_results.values())
            successful_updates = sum(1 for result in game_results.values() if result['success'])
            total_active_found = sum(result['total_active_found'] for result in game_results.values())
            total_filtered = sum(result['filtered_active'] for result in game_results.values())
            avg_quality_score = sum(result['quality_score'] for result in game_results.values()) / len(game_results) if game_results else 0
            total_high_confidence = sum(result['high_confidence_codes'] for result in game_results.values())
            total_medium_confidence = sum(result['medium_confidence_codes'] for result in game_results.values())
            
            # Log summary
            summary = {
                'timestamp': datetime.now().isoformat(),
                'total_games_processed': len(all_games),
                'successful_updates': successful_updates,
                'total_codes_found': total_codes,
                'total_active_found': total_active_found,
                'total_filtered_codes': total_filtered,
                'average_quality_score': avg_quality_score,
                'total_high_confidence': total_high_confidence,
                'total_medium_confidence': total_medium_confidence,
                'game_results': game_results,
                'status': 'success'
            }
            
            with open('precise_game_pages_update_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info(f"Precise game pages update completed successfully!")
            logger.info(f"Processed {len(all_games)} games, {successful_updates} successful updates")
            logger.info(f"Total codes: {total_codes}, Active found: {total_active_found}, Filtered: {total_filtered}")
            logger.info(f"Average quality score: {avg_quality_score:.2f}, High confidence: {total_high_confidence}, Medium confidence: {total_medium_confidence}")
            
            # Print detailed results
            print("\n" + "="*100)
            print("PRECISE GAME UPDATE SUMMARY WITH SECTION ANCHOR DETECTION")
            print("="*100)
            for game_key, result in game_results.items():
                status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
                quality = f"Q:{result['quality_score']:.2f}" if result['quality_score'] > 0 else "Q:0.00"
                print(f"{game_key.replace('_', ' ').title():<25} | {status:<12} | {result['codes_count']:>3} codes | {quality} | {result['source']}")
                if result['high_confidence_codes'] > 0 or result['medium_confidence_codes'] > 0:
                    print(f"{'':<25} | {'':<12} | High: {result['high_confidence_codes']}, Medium: {result['medium_confidence_codes']}")
            print("="*100)
            
        except Exception as e:
            logger.error(f"Update process failed: {str(e)}")
            raise

def main():
    """Main function to run the precise updater."""
    updater = PreciseGamePagesUpdater()
    updater.run_update()

if __name__ == "__main__":
    main()
