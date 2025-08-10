#!/usr/bin/env python3
"""
URL Validator for ReversCodes Auto-Updating System
Checks all URLs to identify broken links and working sources
"""

import requests
import time
import json
from datetime import datetime
from typing import Dict, List, Tuple
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('url_validation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class URLValidator:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.timeout = 10
        self.results = {}
        
    def validate_url(self, url: str, name: str) -> Dict:
        """Validate a single URL and return status information"""
        try:
            logger.info(f"Checking: {name} - {url}")
            response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            
            if response.status_code == 200:
                # Check if page has actual content (not just a blank page)
                content_length = len(response.text)
                has_content = content_length > 1000  # Basic content check
                
                return {
                    'url': url,
                    'name': name,
                    'status': 'working',
                    'status_code': response.status_code,
                    'content_length': content_length,
                    'has_content': has_content,
                    'final_url': response.url,
                    'error': None
                }
            else:
                return {
                    'url': url,
                    'name': name,
                    'status': 'broken',
                    'status_code': response.status_code,
                    'content_length': 0,
                    'has_content': False,
                    'final_url': response.url,
                    'error': f"HTTP {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            return {
                'url': url,
                'name': name,
                'status': 'timeout',
                'status_code': None,
                'content_length': 0,
                'has_content': False,
                'final_url': None,
                'error': 'Request timeout'
            }
        except requests.exceptions.ConnectionError:
            return {
                'url': url,
                'name': name,
                'status': 'connection_error',
                'status_code': None,
                'content_length': 0,
                'has_content': False,
                'final_url': None,
                'error': 'Connection error'
            }
        except Exception as e:
            return {
                'url': url,
                'name': name,
                'status': 'error',
                'status_code': None,
                'content_length': 0,
                'has_content': False,
                'final_url': None,
                'error': str(e)
            }
    
    def validate_game_sources(self, game_configs: Dict) -> Dict:
        """Validate all game sources and return comprehensive results"""
        all_results = {}
        
        for game_key, game_config in game_configs.items():
            logger.info(f"\n=== Validating {game_key} ===")
            game_results = []
            
            for source in game_config['sources']:
                result = self.validate_url(source['url'], source['name'])
                game_results.append(result)
                
                # Add delay to be respectful to servers
                time.sleep(1)
            
            all_results[game_key] = game_results
            
        return all_results
    
    def generate_report(self, results: Dict) -> str:
        """Generate a comprehensive validation report"""
        report = []
        report.append("=" * 80)
        report.append("URL VALIDATION REPORT")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        
        total_urls = 0
        working_urls = 0
        broken_urls = 0
        timeout_urls = 0
        error_urls = 0
        
        for game_key, game_results in results.items():
            report.append(f"\n{game_key.upper().replace('_', ' ')}:")
            report.append("-" * 40)
            
            for result in game_results:
                total_urls += 1
                status = result['status']
                
                if status == 'working':
                    working_urls += 1
                    if result['has_content']:
                        report.append(f"✅ {result['name']} - WORKING ({result['content_length']} chars)")
                    else:
                        report.append(f"⚠️  {result['name']} - WORKING BUT NO CONTENT ({result['content_length']} chars)")
                elif status == 'broken':
                    broken_urls += 1
                    report.append(f"❌ {result['name']} - BROKEN (HTTP {result['status_code']})")
                elif status == 'timeout':
                    timeout_urls += 1
                    report.append(f"⏰ {result['name']} - TIMEOUT")
                elif status == 'error':
                    error_urls += 1
                    report.append(f"💥 {result['name']} - ERROR: {result['error']}")
                
                report.append(f"    URL: {result['url']}")
                if result['final_url'] and result['final_url'] != result['url']:
                    report.append(f"    Redirected to: {result['final_url']}")
                report.append("")
        
        # Summary
        report.append("=" * 80)
        report.append("SUMMARY")
        report.append("=" * 80)
        report.append(f"Total URLs: {total_urls}")
        report.append(f"Working: {working_urls}")
        report.append(f"Broken: {broken_urls}")
        report.append(f"Timeouts: {timeout_urls}")
        report.append(f"Errors: {error_urls}")
        report.append(f"Success Rate: {(working_urls/total_urls*100):.1f}%" if total_urls > 0 else "N/A")
        
        return "\n".join(report)
    
    def save_results(self, results: Dict, filename: str = "url_validation_results.json"):
        """Save validation results to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"Results saved to {filename}")

def main():
    # Game configurations from the precise updater
    game_configs = {
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
                {'url': 'https://beebom.com/blade-ball-codes/', 'name': 'Beebom Blade Ball Codes'}
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
                {'url': 'https://beebom.com/roblox-jujutsu-shenanigans-codes/', 'name': 'Beebom Jujutsu Shenanigans Codes'}
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
    
    validator = URLValidator()
    
    print("Starting URL validation for ReversCodes auto-updating system...")
    print("This will check all URLs to identify broken links and working sources.")
    print("=" * 80)
    
    # Validate all URLs
    results = validator.validate_game_sources(game_configs)
    
    # Generate and display report
    report = validator.generate_report(results)
    print(report)
    
    # Save results
    validator.save_results(results)
    
    # Save report to file
    with open('url_validation_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nDetailed report saved to: url_validation_report.txt")
    print(f"JSON results saved to: url_validation_results.json")

if __name__ == "__main__":
    main()
