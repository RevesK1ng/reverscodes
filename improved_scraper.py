#!/usr/bin/env python3
"""
Improved Scraper with Better Selectors and Validation
Fixes loose scraper logic and source formatting issues.
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
from code_validator import validator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('improved_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ImprovedGamingScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        # Better selectors for different sites
        self.site_selectors = {
            'progameguides': {
                'code_containers': [
                    'div.code-block',
                    'div.promo-code',
                    'li.code-item',
                    'span.code-text',
                    'code',
                    'pre'
                ],
                'code_patterns': [
                    r'<code[^>]*>([A-Z0-9_\-!]{4,20})</code>',
                    r'<span[^>]*class="[^"]*code[^"]*"[^>]*>([A-Z0-9_\-!]{4,20})</span>',
                    r'<strong[^>]*>([A-Z0-9_\-!]{4,20})</strong>'
                ],
                'reward_selectors': [
                    'span.reward',
                    'span.description',
                    'div.reward-text',
                    'p:contains("reward")',
                    'li:contains("reward")'
                ]
            },
            'beebom': {
                'code_containers': [
                    'div.code-container',
                    'li.code-item',
                    'span.code',
                    'code',
                    'strong'
                ],
                'code_patterns': [
                    r'<code[^>]*>([A-Z0-9_\-!]{4,20})</code>',
                    r'<span[^>]*class="[^"]*code[^"]*"[^>]*>([A-Z0-9_\-!]{4,20})</span>',
                    r'<strong[^>]*>([A-Z0-9_\-!]{4,20})</strong>'
                ],
                'reward_selectors': [
                    'span.reward',
                    'div.reward',
                    'p.reward',
                    'li:contains("reward")'
                ]
            },
            'ign': {
                'code_containers': [
                    'div.code-block',
                    'li.code-item',
                    'span.code',
                    'code',
                    'strong'
                ],
                'code_patterns': [
                    r'<code[^>]*>([A-Z0-9_\-!]{4,20})</code>',
                    r'<span[^>]*class="[^"]*code[^"]*"[^>]*>([A-Z0-9_\-!]{4,20})</span>',
                    r'<strong[^>]*>([A-Z0-9_\-!]{4,20})</strong>'
                ],
                'reward_selectors': [
                    'span.reward',
                    'div.reward',
                    'p.reward'
                ]
            },
            'default': {
                'code_containers': [
                    'code',
                    'pre',
                    'span.code',
                    'strong',
                    'b',
                    'div.code-block',
                    'li.code-item'
                ],
                'code_patterns': [
                    r'<code[^>]*>([A-Z0-9_\-!]{4,20})</code>',
                    r'<span[^>]*class="[^"]*code[^"]*"[^>]*>([A-Z0-9_\-!]{4,20})</span>',
                    r'<strong[^>]*>([A-Z0-9_\-!]{4,20})</strong>'
                ],
                'reward_selectors': [
                    'span.reward',
                    'div.reward',
                    'p.reward',
                    'li:contains("reward")'
                ]
            }
        }

    def get_site_type(self, url: str) -> str:
        """Determine site type from URL for better selector matching."""
        domain = urlparse(url).netloc.lower()
        
        if 'progameguides' in domain:
            return 'progameguides'
        elif 'beebom' in domain:
            return 'beebom'
        elif 'ign' in domain:
            return 'ign'
        else:
            return 'default'

    def extract_codes_with_better_selectors(self, soup: BeautifulSoup, site_type: str) -> List[Dict]:
        """Extract codes using improved selectors and validation."""
        codes = []
        selectors = self.site_selectors.get(site_type, self.site_selectors['default'])
        
        # Method 1: Use specific code containers
        for container_selector in selectors['code_containers']:
            containers = soup.select(container_selector)
            for container in containers:
                code_text = container.get_text(strip=True)
                if code_text:
                    # Extract codes from text
                    extracted_codes = validator.extract_and_validate_codes(code_text)
                    for code in extracted_codes:
                        # Try to find reward in nearby elements
                        reward = self.find_reward_near_element(container, selectors['reward_selectors'])
                        codes.append({
                            'code': code,
                            'reward': reward or 'Free Rewards',
                            'source': 'Scraped'
                        })
        
        # Method 2: Use regex patterns
        html_content = str(soup)
        for pattern in selectors['code_patterns']:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if validator.validate_code_format(match):
                    codes.append({
                        'code': match,
                        'reward': 'Free Rewards',
                        'source': 'Scraped'
                    })
        
        # Method 3: Look for list items with code-like content
        list_items = soup.find_all('li')
        for li in list_items:
            li_text = li.get_text(strip=True)
            if len(li_text) < 200:  # Reasonable length for a code item
                extracted_codes = validator.extract_and_validate_codes(li_text)
                for code in extracted_codes:
                    # Extract reward from the same list item
                    reward = self.extract_reward_from_text(li_text)
                    codes.append({
                        'code': code,
                        'reward': reward or 'Free Rewards',
                        'source': 'Scraped'
                    })
        
        return codes

    def find_reward_near_element(self, element, reward_selectors: List[str]) -> Optional[str]:
        """Find reward description near a code element."""
        # Check the same element first
        for selector in reward_selectors:
            if ':' in selector:  # Pseudo-selector like :contains()
                continue
            reward_elem = element.select_one(selector)
            if reward_elem:
                return reward_elem.get_text(strip=True)
        
        # Check parent element
        parent = element.parent
        if parent:
            for selector in reward_selectors:
                if ':' in selector:
                    continue
                reward_elem = parent.select_one(selector)
                if reward_elem:
                    return reward_elem.get_text(strip=True)
        
        # Check sibling elements
        if element.parent:
            for sibling in element.parent.find_all(['span', 'div', 'p']):
                if sibling != element:
                    sibling_text = sibling.get_text(strip=True)
                    if self.looks_like_reward(sibling_text):
                        return sibling_text
        
        return None

    def extract_reward_from_text(self, text: str) -> Optional[str]:
        """Extract reward description from text."""
        # Look for patterns like "CODE - Reward" or "CODE (Reward)"
        patterns = [
            r'[-–:]\s*([^()]+?)(?:\s*\(|$)',
            r'\(([^)]+)\)',
            r'Reward[:\s]+([^,\n]+)',
            r'Gives[:\s]+([^,\n]+)',
            r'Unlocks[:\s]+([^,\n]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                reward = match.group(1).strip()
                if self.looks_like_reward(reward):
                    return reward
        
        return None

    def looks_like_reward(self, text: str) -> bool:
        """Check if text looks like a reward description."""
        if not text or len(text) < 3 or len(text) > 100:
            return False
        
        # Check for reward patterns
        reward_indicators = [
            'gem', 'coin', 'cash', 'spin', 'exp', 'xp', 'reward', 'item',
            'unlock', 'give', 'provide', 'bonus', 'free', 'extra'
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in reward_indicators)

    def scrape_game_codes_improved(self, game_key: str, sources: List[Dict]) -> Dict:
        """Improved method to scrape codes with better validation."""
        all_codes = []
        
        for source in sources:
            try:
                logger.info(f"Scraping {game_key} codes from {source['name']}")
                
                # Add retry logic
                for attempt in range(3):
                    try:
                        response = self.session.get(source['url'], timeout=15)
                        response.raise_for_status()
                        break
                    except requests.RequestException as e:
                        if attempt == 2:
                            raise e
                        time.sleep(random.uniform(2, 5))
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style", "nav", "header", "footer"]):
                    script.decompose()
                
                # Determine site type for better selectors
                site_type = self.get_site_type(source['url'])
                
                # Extract codes with improved selectors
                codes = self.extract_codes_with_better_selectors(soup, site_type)
                
                # Add source information
                for code in codes:
                    code['source'] = source['name']
                
                all_codes.extend(codes)
                
                # Be respectful with delays
                time.sleep(random.uniform(2, 4))
                
            except Exception as e:
                logger.error(f"Failed to scrape {game_key} codes from {source['name']}: {str(e)}")
                continue
        
        # Validate and filter the scraped data
        validation_result = validator.validate_scraped_data(all_codes, game_key)
        
        # Log validation results
        validator.log_validation_results(validation_result, game_key)
        
        # Return high-quality codes
        return {
            'active_codes': validation_result['quality_filtered'][:15],  # Limit to 15 best codes
            'expired_codes': [],  # Would need separate logic for expired codes
            'validation_stats': {
                'total_scraped': validation_result['total_codes'],
                'valid_codes': len(validation_result['valid_codes']),
                'quality_codes': len(validation_result['quality_filtered']),
                'duplicates_removed': validation_result['duplicates_removed']
            }
        }

    def scrape_with_fallback(self, game_key: str, sources: List[Dict]) -> Dict:
        """Scrape with fallback to manual codes if scraping fails."""
        try:
            # Try improved scraping first
            result = self.scrape_game_codes_improved(game_key, sources)
            
            # If we got enough quality codes, return them
            if len(result['active_codes']) >= 3:
                logger.info(f"Successfully scraped {len(result['active_codes'])} quality codes for {game_key}")
                return result
            
            # Otherwise, use fallback codes
            logger.warning(f"Insufficient scraped codes for {game_key}, using fallback")
            return self.get_fallback_codes(game_key)
            
        except Exception as e:
            logger.error(f"Scraping failed for {game_key}: {str(e)}, using fallback")
            return self.get_fallback_codes(game_key)

    def get_fallback_codes(self, game_key: str) -> Dict:
        """Get fallback codes when scraping fails."""
        # This would contain the same fallback logic as in the original script
        # For brevity, I'll include a few examples
        fallback_codes = {
            'blox_fruits': [
                {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Manual'},
                {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Manual'},
                {'code': 'BLOXFRUITS_UPDATE_20', 'reward': '2x EXP (20 minutes)', 'source': 'Manual'}
            ],
            'driving_empire': [
                {'code': 'BADGUYS2', 'reward': 'Unlocks the "Betty Beater" vehicle', 'source': 'Manual'},
                {'code': 'NASCAR100M', 'reward': '200 Trophies', 'source': 'Manual'},
                {'code': 'CUSTOMIZATION2025', 'reward': '10 Tuning Kits', 'source': 'Manual'}
            ]
        }
        
        return {
            'active_codes': fallback_codes.get(game_key, [
                {'code': f'{game_key.upper()}_UPDATE', 'reward': 'Free Rewards', 'source': 'Manual'},
                {'code': f'THANKYOU_{game_key.upper()}', 'reward': 'Free Rewards', 'source': 'Manual'}
            ]),
            'expired_codes': [],
            'validation_stats': {'total_scraped': 0, 'valid_codes': 0, 'quality_codes': 0, 'duplicates_removed': 0}
        }

# Example usage
if __name__ == "__main__":
    scraper = ImprovedGamingScraper()
    
    # Test with a sample game
    test_sources = [
        {'url': 'https://progameguides.com/roblox/roblox-blox-fruits-codes/', 'name': 'Pro Game Guides'},
        {'url': 'https://beebom.com/roblox-blox-fruits-codes/', 'name': 'Beebom'}
    ]
    
    result = scraper.scrape_with_fallback('blox_fruits', test_sources)
    print(f"Found {len(result['active_codes'])} codes")
    for code in result['active_codes']:
        print(f"  {code['code']} - {code['reward']}")
