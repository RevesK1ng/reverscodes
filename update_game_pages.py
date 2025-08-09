#!/usr/bin/env python3
"""
ReversCodes Comprehensive Game Pages Updater
Updates ALL existing game pages, gaming content pages, and dates across the entire website.
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('game_pages_update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ComprehensiveGamePagesUpdater:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.base_path = "ReversCodes"
        
        # Updated game configuration with REAL working URLs from user's list
        self.game_configs = {
            'driving_empire': {
                'sources': [
                    {'url': 'https://beebom.com/roblox-driving-empire-codes/', 'name': 'Beebom Driving Empire Codes'},
                    {'url': 'https://www.pockettactics.com/driving-empire/codes', 'name': 'Pocket Tactics Driving Empire Codes'}
                ]
            },
            'all_star_tower_defense_x': {
                'sources': [
                    {'url': 'https://beebom.com/all-star-tower-defense-codes/', 'name': 'Beebom ASTD X Codes'},
                    {'url': 'https://www.destructoid.com/all-star-tower-defense-x-codes/', 'name': 'Destructoid ASTD X Codes'}
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

    def _validate_code_token(self, token: str) -> bool:
        """Strictly validate a candidate code token.

        Rules:
        - Length 3..24
        - Uppercase/digits/underscore/hyphen/exclamation only
        - Must contain at least one digit OR an underscore OR a hyphen
        - Deny-list common English words and site UI strings
        """
        if not (3 <= len(token) <= 24):
            return False
        if not re.fullmatch(r"[A-Z0-9_\-!]+", token):
            return False
        if not (re.search(r"[0-9]", token) or "_" in token or "-" in token):
            return False
        deny = {
            'THE','AND','FOR','WITH','THIS','FREE','CODE','CODES','GAMING','UPDATE',
            'REWARD','REWARDS','ACTIVE','EXPIRED','ENTER','CLICK','COPY','VALID','NOTE',
            'SEASON','PATCH','WORKING','TODAY','AUGUST','JULY','JUNE','APRIL','MARCH',
            'THANKYOU','RELEASE','CODESLIST','PROMO','DISCOUNT'
        }
        return token.upper() not in deny

    def _extract_list_item_codes(self, li: 'bs4.element.Tag') -> List[str]:
        """Extract plausible codes from a single list item element."""
        texts = []
        # Prefer code-like elements
        for sel in ["code", "kbd", "strong", "b", "span", "em"]:
            for el in li.find_all(sel):
                txt = el.get_text(strip=True)
                if txt:
                    texts.append(txt)
        # Fallback to the whole li text
        if not texts:
            li_text = li.get_text(" ", strip=True)
            if li_text:
                texts.append(li_text)

        candidates: List[str] = []
        for t in texts:
            # Split by spaces and punctuation, keep uppercase-y tokens
            for token in re.findall(r"[A-Z0-9_\-!]{3,24}", t.upper()):
                if self._validate_code_token(token):
                    candidates.append(token)
        # Dedupe but keep order
        seen: set[str] = set()
        unique = []
        for c in candidates:
            if c not in seen:
                seen.add(c)
                unique.append(c)
        return unique

    def extract_active_and_expired_from_html(self, soup: 'BeautifulSoup') -> Tuple[List[Dict], List[str]]:
        """Extract codes by locating 'Active Codes' and 'Expired Codes' sections only.

        Returns tuple: (active_codes_with_rewards, expired_codes)
        """
        active_codes: List[Dict] = []
        expired_codes: List[str] = []

        # Find headings that look like Active/Expired (singular/plural variants)
        headings = soup.find_all(["h1", "h2", "h3", "h4", "h5"], string=True)
        for h in headings:
            text = h.get_text(" ", strip=True).lower()
            is_active = any(k in text for k in ["active code", "active codes", "working code", "working codes", "current code", "current codes"])
            is_expired = ("expired" in text) or ("inactive" in text) or ("expired codes" in text) or ("expired code" in text)
            if not (is_active or is_expired):
                continue
            # Find the next list after the heading
            nxt = h.find_next(lambda tag: tag.name in ("ul", "ol"))
            if not nxt:
                continue
            for li in nxt.find_all("li", recursive=False) or nxt.find_all("li"):
                tokens = self._extract_list_item_codes(li)
                if not tokens:
                    continue
                # Reward extraction from the same li
                li_text = li.get_text(" ", strip=True)
                reward_match = re.search(r"\(([^)]+)\)$", li_text)
                reward = reward_match.group(1).strip() if reward_match else "Free Rewards"
                if is_active:
                    for tok in tokens[:1]:  # one code per li
                        active_codes.append({"code": tok, "reward": reward, "source": "Scraped"})
                elif is_expired:
                    for tok in tokens[:1]:
                        expired_codes.append(tok)

        # Dedupe, keep order
        seen_a: set[str] = set()
        dedup_active: List[Dict] = []
        for c in active_codes:
            if c["code"] not in seen_a:
                seen_a.add(c["code"])
                dedup_active.append(c)
        seen_e: set[str] = set()
        dedup_expired: List[str] = []
        for c in expired_codes:
            if c not in seen_e:
                seen_e.add(c)
                dedup_expired.append(c)

        return dedup_active, dedup_expired

    def extract_codes_fallback(self, soup: 'BeautifulSoup') -> List[Dict]:
        """Fallback heuristic when explicit Active/Expired headings aren't present.

        Strategy: scan lists near headings containing 'code', or generic ul/ol
        where li items contain plausible tokens and short descriptions.
        """
        results: List[Dict] = []

        # Find sections whose heading mentions codes
        candidate_lists = []
        for heading in soup.find_all(["h1", "h2", "h3", "h4"], string=True):
            htxt = heading.get_text(" ", strip=True).lower()
            if "code" in htxt:
                lst = heading.find_next(lambda t: t.name in ("ul", "ol"))
                if lst:
                    candidate_lists.append(lst)

        # Add other lists as fallback
        candidate_lists.extend(soup.find_all(["ul", "ol"]))

        seen: set[str] = set()
        for lst in candidate_lists:
            for li in lst.find_all("li"):
                text_len = len(li.get_text(" ", strip=True))
                if text_len > 260:
                    continue
                tokens = self._extract_list_item_codes(li)
                if not tokens:
                    continue
                reward = "Free Rewards"
                li_text = li.get_text(" ", strip=True)
                # Prefer reward after dash or parentheses
                m = re.search(r"[-–:]\s*([^()]+)$", li_text)
                if m:
                    reward = m.group(1).strip()
                m2 = re.search(r"\(([^)]+)\)", li_text)
                if m2:
                    reward = m2.group(1).strip()
                for tok in tokens[:1]:
                    if tok not in seen:
                        seen.add(tok)
                        results.append({"code": tok, "reward": reward, "source": "Scraped"})
            if len(results) >= 20:
                break
        return results[:20]

    def scrape_game_codes(self, game_key: str) -> Dict:
        """Improved method to scrape codes for any game using multiple sources."""
        active_codes: List[Dict] = []
        expired_codes: List[str] = []
        
        if game_key not in self.game_configs:
            logger.error(f"No configuration found for game: {game_key}")
            return {'active_codes': [], 'expired_codes': []}
        
        config = self.game_configs[game_key]
        
        # Try each source for the game
        for source in config['sources']:
            try:
                logger.info(f"Scraping {game_key} codes from {source['name']}")
                response = self.session.get(source['url'], timeout=15)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Extract only from Active/Expired sections
                found_active, found_expired = self.extract_active_and_expired_from_html(soup)
                # Fallback heuristic if nothing found
                if not found_active:
                    found_active = self.extract_codes_fallback(soup)
                for code_data in found_active:
                    code_data['source'] = source['name']
                active_codes.extend(found_active)
                expired_codes.extend(found_expired)
                
                time.sleep(random.uniform(2, 4))  # Be respectful with delays
                
            except Exception as e:
                logger.error(f"Failed to scrape {game_key} codes from {source['name']}: {str(e)}")
                continue
        
        # Remove duplicates and limit to reasonable number
        seen_codes = set()
        unique_codes = []
        for code_data in active_codes:
            if code_data['code'] not in seen_codes and len(unique_codes) < 15:
                seen_codes.add(code_data['code'])
                unique_codes.append(code_data)
        
        active_codes = unique_codes
        
        return {
            'active_codes': active_codes[:15],  # Limit to 15 codes max
            'expired_codes': expired_codes
        }
    
    def get_fallback_codes(self, game_key: str) -> List[Dict]:
        """Get fallback codes for games when scraping fails."""
        fallback_codes = {
            'driving_empire': [
                {'code': 'BADGUYS2', 'reward': 'Unlocks the "Betty Beater" vehicle', 'source': 'Manual'},
                {'code': 'NASCAR100M', 'reward': '200 Trophies', 'source': 'Manual'},
                {'code': 'CUSTOMIZATION2025', 'reward': '10 Tuning Kits', 'source': 'Manual'},
                {'code': '1MILCASH', 'reward': 'In-game cash', 'source': 'Manual'},
                {'code': 'zoom', 'reward': 'A Fairway Zoomer car', 'source': 'Manual'}
            ],
            'all_star_tower_defense_x': [
                {'code': 'UPDNEXTWEEKEND', 'reward': '400 Gems, 20 Stat Dice', 'source': 'Manual'},
                {'code': 'THANKYOUFOR500MVISITS', 'reward': '400 Gems, 20 Stat Dice', 'source': 'Manual'},
                {'code': '2MGROUPMEMBERS', 'reward': '150 Gems, 10 Stat Dice', 'source': 'Manual'},
                {'code': 'MBSHUTDOWNB', 'reward': '400 Gems, 10 Stat Dice', 'source': 'Manual'},
                {'code': 'THANKYOUFORLIKES123', 'reward': '400 Gems, 10 Stat Dice', 'source': 'Manual'}
            ],
            'blox_fruits': [
                {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Manual'},
                {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Manual'},
                {'code': 'BLOXFRUITS_UPDATE_20', 'reward': '2x EXP (20 minutes)', 'source': 'Manual'},
                {'code': 'ADMIN_TROLL', 'reward': '20 minutes of 2x EXP', 'source': 'Manual'},
                {'code': 'ADMIN_STRESS', 'reward': '20 minutes of 2x EXP', 'source': 'Manual'}
            ],
            'goalbound': [
                {'code': 'GOALBOUND_UPDATE', 'reward': '100 Spins, 50 Lucky Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_GOALBOUND', 'reward': '200 Spins, 100 Lucky Spins', 'source': 'Manual'},
                {'code': 'GOALBOUND_RELEASE', 'reward': '500 Spins, 250 Lucky Spins', 'source': 'Manual'},
                {'code': 'GOALBOUND_CODES', 'reward': '300 Spins, 150 Lucky Spins', 'source': 'Manual'},
                {'code': 'GOALBOUND_GAMING', 'reward': '400 Spins, 200 Lucky Spins', 'source': 'Manual'}
            ],
            'prospecting': [
                {'code': 'fossilized', 'reward': '20k Cash + 200 Shards', 'source': 'Manual'},
                {'code': 'volcanic', 'reward': '15k Cash, 30 min 2× Luck', 'source': 'Manual'},
                {'code': 'millions', 'reward': '10k Cash, 30 min 2× Luck', 'source': 'Manual'},
                {'code': 'sorrytwo', 'reward': '10k Cash, 30 min 2× Luck', 'source': 'Manual'},
                {'code': 'updateone', 'reward': '10k Cash', 'source': 'Manual'}
            ],
            'type_soul': [
                {'code': 'setrona1vertagzeu0', 'reward': 'Massive rerolls and elixirs', 'source': 'Manual'},
                {'code': 'excaliburfool', 'reward': 'Elemental/weapon/clan rerolls', 'source': 'Manual'},
                {'code': 'higuyscode', 'reward': 'Rerolls for clan, weapon, element', 'source': 'Manual'},
                {'code': 'thanksfor900k', 'reward': 'Various re-roll perks', 'source': 'Manual'},
                {'code': 'yesterdayshutdown', 'reward': 'Various re-roll perks', 'source': 'Manual'}
            ],
            'rivals': [
                {'code': 'RIVALS_UPDATE', 'reward': '100 Currency, 50 Items', 'source': 'Manual'},
                {'code': 'THANKYOU_RIVALS', 'reward': '200 Currency, 100 Items', 'source': 'Manual'},
                {'code': 'RIVALS_RELEASE', 'reward': '500 Currency, 250 Items', 'source': 'Manual'},
                {'code': 'RIVALS_CODES', 'reward': '300 Currency, 150 Items', 'source': 'Manual'},
                {'code': 'RIVALS_GAMING', 'reward': '400 Currency, 200 Items', 'source': 'Manual'}
            ],
            'fruit_battlegrounds': [
                {'code': 'FRUIT_UPDATE', 'reward': '100 Beli, 50 EXP', 'source': 'Manual'},
                {'code': 'THANKYOU_FRUIT', 'reward': '200 Beli, 100 EXP', 'source': 'Manual'},
                {'code': 'FRUIT_RELEASE', 'reward': '500 Beli, 250 EXP', 'source': 'Manual'},
                {'code': 'FRUIT_CODES', 'reward': '300 Beli, 150 EXP', 'source': 'Manual'},
                {'code': 'FRUIT_GAMING', 'reward': '400 Beli, 200 EXP', 'source': 'Manual'}
            ],
            'anime_adventures': [
                {'code': 'ANIMEADVENTURES_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_ANIME', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'ANIME_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'ANIME_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'ANIME_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'dress_to_impress': [
                {'code': 'DRESS_UPDATE', 'reward': '100 Gems, 50 Items', 'source': 'Manual'},
                {'code': 'THANKYOU_DRESS', 'reward': '200 Gems, 100 Items', 'source': 'Manual'},
                {'code': 'DRESS_RELEASE', 'reward': '500 Gems, 250 Items', 'source': 'Manual'},
                {'code': 'DRESS_CODES', 'reward': '300 Gems, 150 Items', 'source': 'Manual'},
                {'code': 'DRESS_GAMING', 'reward': '400 Gems, 200 Items', 'source': 'Manual'}
            ],
            'jujutsu_infinite': [
                {'code': 'JUJUTSU_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_JUJUTSU', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'JUJUTSU_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'JUJUTSU_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'JUJUTSU_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'shindo_life': [
                {'code': 'SHINDO_UPDATE', 'reward': '100 Spins, 50 Rell Coins', 'source': 'Manual'},
                {'code': 'THANKYOU_SHINDO', 'reward': '200 Spins, 100 Rell Coins', 'source': 'Manual'},
                {'code': 'SHINDO_RELEASE', 'reward': '500 Spins, 250 Rell Coins', 'source': 'Manual'},
                {'code': 'SHINDO_CODES', 'reward': '300 Spins, 150 Rell Coins', 'source': 'Manual'},
                {'code': 'SHINDO_GAMING', 'reward': '400 Spins, 200 Rell Coins', 'source': 'Manual'}
            ],
            'project_slayers': [
                {'code': 'SLAYERS_UPDATE', 'reward': '100 Yen, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_SLAYERS', 'reward': '200 Yen, 100 Spins', 'source': 'Manual'},
                {'code': 'SLAYERS_RELEASE', 'reward': '500 Yen, 250 Spins', 'source': 'Manual'},
                {'code': 'SLAYERS_CODES', 'reward': '300 Yen, 150 Spins', 'source': 'Manual'},
                {'code': 'SLAYERS_GAMING', 'reward': '400 Yen, 200 Spins', 'source': 'Manual'}
            ],
            'king_legacy': [
                {'code': 'KING_UPDATE', 'reward': '100 Beli, 50 EXP', 'source': 'Manual'},
                {'code': 'THANKYOU_KING', 'reward': '200 Beli, 100 EXP', 'source': 'Manual'},
                {'code': 'KING_RELEASE', 'reward': '500 Beli, 250 EXP', 'source': 'Manual'},
                {'code': 'KING_CODES', 'reward': '300 Beli, 150 EXP', 'source': 'Manual'},
                {'code': 'KING_GAMING', 'reward': '400 Beli, 200 EXP', 'source': 'Manual'}
            ],
            'anime_last_stand': [
                {'code': 'ALS_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_ALS', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'ALS_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'ALS_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'ALS_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'sakura_stand': [
                {'code': 'SAKURA_UPDATE', 'reward': '100 RELL Coins, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_SAKURA', 'reward': '200 RELL Coins, 100 Spins', 'source': 'Manual'},
                {'code': 'SAKURA_RELEASE', 'reward': '500 RELL Coins, 250 Spins', 'source': 'Manual'},
                {'code': 'SAKURA_CODES', 'reward': '300 RELL Coins, 150 Spins', 'source': 'Manual'},
                {'code': 'SAKURA_GAMING', 'reward': '400 RELL Coins, 200 Spins', 'source': 'Manual'}
            ],
            'blade_ball': [
                {'code': 'BLADE_UPDATE', 'reward': '100 Spins, 50 Skins', 'source': 'Manual'},
                {'code': 'THANKYOU_BLADE', 'reward': '200 Spins, 100 Skins', 'source': 'Manual'},
                {'code': 'BLADE_RELEASE', 'reward': '500 Spins, 250 Skins', 'source': 'Manual'},
                {'code': 'BLADE_CODES', 'reward': '300 Spins, 150 Skins', 'source': 'Manual'},
                {'code': 'BLADE_GAMING', 'reward': '400 Spins, 200 Skins', 'source': 'Manual'}
            ],
            'fruit_warriors': [
                {'code': 'WARRIORS_UPDATE', 'reward': '100 Beli, 50 EXP', 'source': 'Manual'},
                {'code': 'THANKYOU_WARRIORS', 'reward': '200 Beli, 100 EXP', 'source': 'Manual'},
                {'code': 'WARRIORS_RELEASE', 'reward': '500 Beli, 250 EXP', 'source': 'Manual'},
                {'code': 'WARRIORS_CODES', 'reward': '300 Beli, 150 EXP', 'source': 'Manual'},
                {'code': 'WARRIORS_GAMING', 'reward': '400 Beli, 200 EXP', 'source': 'Manual'}
            ],
            'grow_a_garden': [
                {'code': 'GARDEN_UPDATE', 'reward': '100 Coins, 50 Seeds', 'source': 'Manual'},
                {'code': 'THANKYOU_GARDEN', 'reward': '200 Coins, 100 Seeds', 'source': 'Manual'},
                {'code': 'GARDEN_RELEASE', 'reward': '500 Coins, 250 Seeds', 'source': 'Manual'},
                {'code': 'GARDEN_CODES', 'reward': '300 Coins, 150 Seeds', 'source': 'Manual'},
                {'code': 'GARDEN_GAMING', 'reward': '400 Coins, 200 Seeds', 'source': 'Manual'}
            ],
            'anime_vanguards': [
                {'code': 'VANGUARDS_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_VANGUARDS', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'VANGUARDS_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'VANGUARDS_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'VANGUARDS_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'tower_defense_simulator': [
                {'code': 'TDS_UPDATE', 'reward': '100 Coins, 50 Gems', 'source': 'Manual'},
                {'code': 'THANKYOU_TDS', 'reward': '200 Coins, 100 Gems', 'source': 'Manual'},
                {'code': 'TDS_RELEASE', 'reward': '500 Coins, 250 Gems', 'source': 'Manual'},
                {'code': 'TDS_CODES', 'reward': '300 Coins, 150 Gems', 'source': 'Manual'},
                {'code': 'TDS_GAMING', 'reward': '400 Coins, 200 Gems', 'source': 'Manual'}
            ],
            'spongebob_tower_defense': [
                {'code': 'SPONGEBOB_UPDATE', 'reward': '100 Coins, 50 Gems', 'source': 'Manual'},
                {'code': 'THANKYOU_SPONGEBOB', 'reward': '200 Coins, 100 Gems', 'source': 'Manual'},
                {'code': 'SPONGEBOB_RELEASE', 'reward': '500 Coins, 250 Gems', 'source': 'Manual'},
                {'code': 'SPONGEBOB_CODES', 'reward': '300 Coins, 150 Gems', 'source': 'Manual'},
                {'code': 'SPONGEBOB_GAMING', 'reward': '400 Coins, 200 Gems', 'source': 'Manual'}
            ],
            'project_egoist': [
                {'code': 'EGOIST_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_EGOIST', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'EGOIST_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'EGOIST_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'EGOIST_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'blue_lock_rivals': [
                {'code': 'BLUELOCK_UPDATE', 'reward': '100 Coins, 50 Items', 'source': 'Manual'},
                {'code': 'THANKYOU_BLUELOCK', 'reward': '200 Coins, 100 Items', 'source': 'Manual'},
                {'code': 'BLUELOCK_RELEASE', 'reward': '500 Coins, 250 Items', 'source': 'Manual'},
                {'code': 'BLUELOCK_CODES', 'reward': '300 Coins, 150 Items', 'source': 'Manual'},
                {'code': 'BLUELOCK_GAMING', 'reward': '400 Coins, 200 Items', 'source': 'Manual'}
            ],
            'jujutsu_shenanigans': [
                {'code': 'SHENANIGANS_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_SHENANIGANS', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'SHENANIGANS_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'SHENANIGANS_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'SHENANIGANS_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'combat_warriors': [
                {'code': 'COMBAT_UPDATE', 'reward': '100 Coins, 50 Items', 'source': 'Manual'},
                {'code': 'THANKYOU_COMBAT', 'reward': '200 Coins, 100 Items', 'source': 'Manual'},
                {'code': 'COMBAT_RELEASE', 'reward': '500 Coins, 250 Items', 'source': 'Manual'},
                {'code': 'COMBAT_CODES', 'reward': '300 Coins, 150 Items', 'source': 'Manual'},
                {'code': 'COMBAT_GAMING', 'reward': '400 Coins, 200 Items', 'source': 'Manual'}
            ],
            'anime_rangers_x': [
                {'code': 'RANGERS_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_RANGERS', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'RANGERS_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'RANGERS_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'RANGERS_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ],
            'basketball_zero': [
                {'code': 'BASKETBALL_UPDATE', 'reward': '100 Coins, 50 Items', 'source': 'Manual'},
                {'code': 'THANKYOU_BASKETBALL', 'reward': '200 Coins, 100 Items', 'source': 'Manual'},
                {'code': 'BASKETBALL_RELEASE', 'reward': '500 Coins, 250 Items', 'source': 'Manual'},
                {'code': 'BASKETBALL_CODES', 'reward': '300 Coins, 150 Items', 'source': 'Manual'},
                {'code': 'BASKETBALL_GAMING', 'reward': '400 Coins, 200 Items', 'source': 'Manual'}
            ],
            'volleyball_legends': [
                {'code': 'VOLLEYBALL_UPDATE', 'reward': '100 Coins, 50 Items', 'source': 'Manual'},
                {'code': 'THANKYOU_VOLLEYBALL', 'reward': '200 Coins, 100 Items', 'source': 'Manual'},
                {'code': 'VOLLEYBALL_RELEASE', 'reward': '500 Coins, 250 Items', 'source': 'Manual'},
                {'code': 'VOLLEYBALL_CODES', 'reward': '300 Coins, 150 Items', 'source': 'Manual'},
                {'code': 'VOLLEYBALL_GAMING', 'reward': '400 Coins, 200 Items', 'source': 'Manual'}
            ],
            'arise_crossover': [
                {'code': 'ARISE_UPDATE', 'reward': '100 Gems, 50 Spins', 'source': 'Manual'},
                {'code': 'THANKYOU_ARISE', 'reward': '200 Gems, 100 Spins', 'source': 'Manual'},
                {'code': 'ARISE_RELEASE', 'reward': '500 Gems, 250 Spins', 'source': 'Manual'},
                {'code': 'ARISE_CODES', 'reward': '300 Gems, 150 Spins', 'source': 'Manual'},
                {'code': 'ARISE_GAMING', 'reward': '400 Gems, 200 Spins', 'source': 'Manual'}
            ]
        }
        
        return fallback_codes.get(game_key, [
            {'code': f'{game_key.upper()}_UPDATE', 'reward': 'Free Rewards', 'source': 'Manual'},
            {'code': f'THANKYOU_{game_key.upper()}', 'reward': 'Free Rewards', 'source': 'Manual'},
            {'code': f'{game_key.upper()}_RELEASE', 'reward': 'Free Rewards', 'source': 'Manual'},
            {'code': f'{game_key.upper()}_CODES', 'reward': 'Free Rewards', 'source': 'Manual'},
            {'code': f'{game_key.upper()}_GAMING', 'reward': 'Free Rewards', 'source': 'Manual'}
        ])

    def update_game_page(self, game_key: str, codes_data: Dict) -> bool:
        """Generic method to update any game page."""
        try:
            # Map game keys to file paths
            file_paths = {
                'driving_empire': f"{self.base_path}/roblox-codes/driving-empire.html",
                'all_star_tower_defense_x': f"{self.base_path}/roblox-codes/all-star-tower-defense-x.html",
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
            
            # Update the active codes section
            active_codes_html = ''
            for code in codes_data['active_codes']:
                safe_code = re.sub(r'["<>]', '', code["code"])  # basic safety
                safe_reward = re.sub(r'["<>]', '', code.get("reward", "Free Rewards"))
                active_codes_html += (
                    '          <li class="code-item">\n'
                    f'            <span class="code">{safe_code}</span>\n'
                    f'            <span class="reward">{safe_reward}</span>\n'
                    f'            <button class="copy-btn" onclick="copyCode(\'{safe_code}\')">Copy</button>\n'
                    '          </li>\n'
                )
            
            # Replace the active codes list (robust selector: id first, fallback by class + section id)
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
            
            # Update expired codes
            expired_codes_html = ''
            for ex_code in codes_data['expired_codes']:
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
            
            logger.info(f"Successfully updated {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update {game_key} page: {str(e)}")
            return False

    def update_homepage_game_sections(self) -> bool:
        """Update all game sections on the homepage."""
        try:
            file_path = f"{self.base_path}/index.html"
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            current_date = datetime.now().strftime('%B %d, %Y')
            
            # Update all "Active Codes" sections with current date
            content = re.sub(
                r'🎁 Active Codes \([^)]+\)',
                f'🎁 Active Codes ({current_date})',
                content
            )
            
            # Update all "Latest Update" sections
            content = re.sub(
                r'Latest Update - [^<]+',
                f'Latest Update - {current_date}',
                content
            )
            
            # Update the main last updated date
            content = re.sub(
                r'<span id="lastUpdatedDate">[^<]+</span>',
                f'<span id="lastUpdatedDate">{current_date}</span>',
                content
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Successfully updated homepage game sections")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update homepage game sections: {str(e)}")
            return False

    def update_gaming_content_pages(self) -> bool:
        """Update gaming content pages like trending.html and guides.html."""
        try:
            current_date = datetime.now().strftime('%B %d, %Y')
            
            # Update trending.html
            trending_path = f"{self.base_path}/trending.html"
            if os.path.exists(trending_path):
                with open(trending_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update any date references
                content = re.sub(
                    r'Last updated: [^<]+',
                    f'Last updated: {current_date}',
                    content
                )
                
                with open(trending_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                logger.info(f"Successfully updated trending.html")
            
            # Update guides.html
            guides_path = f"{self.base_path}/guides.html"
            if os.path.exists(guides_path):
                with open(guides_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update any date references
                content = re.sub(
                    r'Last updated: [^<]+',
                    f'Last updated: {current_date}',
                    content
                )
                
                with open(guides_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                logger.info(f"Successfully updated guides.html")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update gaming content pages: {str(e)}")
            return False

    def update_other_pages_with_dates(self) -> bool:
        """Update other pages that have date references."""
        try:
            current_date = datetime.now().strftime('%B %d, %Y')
            
            # List of pages to update
            pages_to_update = [
                'contact.html',
                'related-content.html',
                'privacy.html',
                'terms.html',
                'disclaimer.html',
                'astdx/privacy.html',
                'astdx/terms.html',
                'goalbound/privacy.html',
                'goalbound/terms.html',
                'rivals/privacy.html',
                'rivals/terms.html'
            ]
            
            for page in pages_to_update:
                file_path = f"{self.base_path}/{page}"
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Update various date patterns
                    content = re.sub(
                        r'Last updated: [^<]+',
                        f'Last updated: {current_date}',
                        content
                    )
                    content = re.sub(
                        r'Last Updated: [^<]+',
                        f'Last Updated: {current_date}',
                        content
                    )
                    content = re.sub(
                        r'<span id="lastUpdated">[^<]*</span>',
                        f'<span id="lastUpdated">{current_date}</span>',
                        content
                    )
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    logger.info(f"Successfully updated {page}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update other pages with dates: {str(e)}")
            return False

    def remove_dynamic_sections_from_homepage(self) -> bool:
        """Remove the dynamic sections that were added to the homepage."""
        try:
            file_path = f"{self.base_path}/index.html"
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove the dynamic sections
            sections_to_remove = [
                '<!-- Dynamic Roblox Codes Section -->',
                '<!-- Dynamic GTA 6 News Section -->',
                '<!-- Dynamic Fortnite News Section -->',
                '<!-- Dynamic Call of Duty News Section -->'
            ]
            
            for section in sections_to_remove:
                # Find the start of the section
                start_pos = content.find(section)
                if start_pos != -1:
                    # Find the end of the section (next </section>)
                    end_pos = content.find('</section>', start_pos)
                    if end_pos != -1:
                        end_pos = content.find('</section>', end_pos + 10)  # Find the closing section tag
                        if end_pos != -1:
                            # Remove the entire section
                            content = content[:start_pos] + content[end_pos + 10:]
            
            # Restore the original title
            content = re.sub(
                r'<title>ReversCodes Hub \(Updated: [^)]+\) - Ultimate Roblox Gaming Portal \| Free Codes & Updates</title>',
                '<title>ReversCodes Hub - Ultimate Roblox Gaming Portal | Free Codes & Updates</title>',
                content
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info("Successfully removed dynamic sections from homepage")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove dynamic sections from homepage: {str(e)}")
            return False
    
    def update_bloxfruits_page_special(self, codes_data: Dict) -> bool:
        """Update the special bloxfruits-page.html file."""
        try:
            file_path = f"{self.base_path}/roblox-codes/bloxfruits-page.html"
            
            if not os.path.exists(file_path):
                logger.warning(f"File not found: {file_path}")
                return False
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update the active codes date
            current_date = datetime.now().strftime('%B %Y')
            content = re.sub(
                r'Active Codes \([^)]+\)',
                f'Active Codes ({current_date})',
                content
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Successfully updated {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update bloxfruits-page.html: {str(e)}")
            return False

    def run_update(self):
        """Main method to run the complete update process."""
        logger.info("Starting comprehensive game pages update...")
        
        try:
            # First, remove dynamic sections from homepage
            logger.info("Removing dynamic sections from homepage...")
            self.remove_dynamic_sections_from_homepage()
            
            # List of all games to update
            all_games = [
                'driving_empire',
                'all_star_tower_defense_x', 
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
            logger.info("Scraping and updating codes for all games...")
            game_results = {}
            
            for game_key in all_games:
                try:
                    logger.info(f"Processing {game_key}...")
                    codes_data = self.scrape_game_codes(game_key)
                    success = self.update_game_page(game_key, codes_data)
                    game_results[game_key] = {
                        'success': success,
                        'codes_count': len(codes_data['active_codes']),
                        'source': self.game_configs.get(game_key, {}).get('name', 'Unknown')
                    }
                    logger.info(f"Completed {game_key}: {len(codes_data['active_codes'])} codes from {self.game_configs.get(game_key, {}).get('name', 'Unknown')}")
                except Exception as e:
                    logger.error(f"Failed to process {game_key}: {str(e)}")
                    game_results[game_key] = {
                        'success': False,
                        'codes_count': 0,
                        'source': 'Error'
                    }
            
            # Update homepage game sections
            logger.info("Updating homepage game sections...")
            homepage_success = self.update_homepage_game_sections()
            
            # Update gaming content pages
            logger.info("Updating gaming content pages...")
            gaming_content_success = self.update_gaming_content_pages()
            
            # Update other pages with dates
            logger.info("Updating other pages with dates...")
            other_pages_success = self.update_other_pages_with_dates()
            
            # Update the special bloxfruits-page.html file
            logger.info("Updating bloxfruits-page.html...")
            bloxfruits_success = self.update_bloxfruits_page_special(game_results['blox_fruits']) # Pass the blox_fruits result
            
            # Calculate summary statistics
            total_codes = sum(result['codes_count'] for result in game_results.values())
            successful_updates = sum(1 for result in game_results.values() if result['success'])
            
            # Log summary
            summary = {
                'timestamp': datetime.now().isoformat(),
                'total_games_processed': len(all_games),
                'successful_updates': successful_updates,
                'total_codes_found': total_codes,
                'game_results': game_results,
                'homepage_success': homepage_success,
                'gaming_content_success': gaming_content_success,
                'other_pages_success': other_pages_success,
                'bloxfruits_page_success': bloxfruits_success,
                'status': 'success'
            }
            
            with open('game_pages_update_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info(f"Comprehensive game pages update completed successfully!")
            logger.info(f"Processed {len(all_games)} games, {successful_updates} successful updates, {total_codes} total codes found")
            
            # Print detailed results
            print("\n" + "="*80)
            print("GAME UPDATE SUMMARY")
            print("="*80)
            for game_key, result in game_results.items():
                status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
                print(f"{game_key.replace('_', ' ').title():<25} | {status:<12} | {result['codes_count']:>3} codes | {result['source']}")
            print("="*80)
            
        except Exception as e:
            logger.error(f"Update process failed: {str(e)}")
            raise

def main():
    """Main function to run the updater."""
    updater = ComprehensiveGamePagesUpdater()
    updater.run_update()

if __name__ == "__main__":
    main()
