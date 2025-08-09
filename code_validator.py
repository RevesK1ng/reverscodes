#!/usr/bin/env python3
"""
Comprehensive Code Validator for ReversCodes Automation
Fixes issues with loose scraper logic, weak validation, and unverified data.
"""

import re
import logging
from typing import List, Dict, Optional, Tuple, Set
from datetime import datetime

logger = logging.getLogger(__name__)

class CodeValidator:
    def __init__(self):
        # Strict code format patterns for different games
        self.code_patterns = {
            'roblox_general': r'^[A-Z0-9_\-!]{4,20}$',
            'blox_fruits': r'^[A-Z0-9_\-]{5,15}$',
            'shindo_life': r'^[A-Z0-9_\-]{4,12}$',
            'type_soul': r'^[a-zA-Z0-9_\-]{8,20}$',
            'driving_empire': r'^[A-Z0-9_\-]{4,15}$',
            'goalbound': r'^[A-Z0-9_\-]{5,15}$',
            'prospecting': r'^[a-zA-Z0-9_\-]{4,12}$'
        }
        
        # Known gaming keywords that indicate valid codes
        self.valid_keywords = {
            'redeem', 'active', 'working', 'valid', 'new', 'latest', 'update',
            'release', 'launch', 'event', 'season', 'patch', 'hotfix', 'maintenance',
            'anniversary', 'celebration', 'thanks', 'thankyou', 'million', 'billion',
            'visits', 'likes', 'subscribers', 'members', 'players', 'community'
        }
        
        # Deny-list of common UI strings and non-code words
        self.deny_list = {
            'THE', 'AND', 'FOR', 'WITH', 'THIS', 'FREE', 'CODE', 'CODES', 'GAMING', 
            'UPDATE', 'REWARD', 'REWARDS', 'ACTIVE', 'EXPIRED', 'ENTER', 'CLICK', 
            'COPY', 'VALID', 'NOTE', 'SEASON', 'PATCH', 'WORKING', 'TODAY', 
            'AUGUST', 'JULY', 'JUNE', 'APRIL', 'MARCH', 'THANKYOU', 'RELEASE', 
            'CODESLIST', 'PROMO', 'DISCOUNT', 'SUBSCRIBE', 'LIKE', 'COMMENT',
            'SHARE', 'FOLLOW', 'JOIN', 'DISCORD', 'TWITTER', 'YOUTUBE', 'INSTAGRAM',
            'FACEBOOK', 'TIKTOK', 'REDDIT', 'WEBSITE', 'OFFICIAL', 'UNOFFICIAL',
            'GUIDE', 'WALKTHROUGH', 'TUTORIAL', 'HELP', 'SUPPORT', 'CONTACT',
            'PRIVACY', 'TERMS', 'POLICY', 'ABOUT', 'HOME', 'MENU', 'NAVIGATION',
            'SEARCH', 'FILTER', 'SORT', 'VIEW', 'EDIT', 'DELETE', 'SAVE', 'CANCEL',
            'CONFIRM', 'SUBMIT', 'RESET', 'REFRESH', 'RELOAD', 'BACK', 'NEXT',
            'PREVIOUS', 'FIRST', 'LAST', 'PAGE', 'SECTION', 'HEADER', 'FOOTER',
            'SIDEBAR', 'MAIN', 'CONTENT', 'TEXT', 'LINK', 'BUTTON', 'IMAGE',
            'VIDEO', 'AUDIO', 'FILE', 'DOWNLOAD', 'UPLOAD', 'INSTALL', 'UNINSTALL',
            'UPDATE', 'UPGRADE', 'VERSION', 'BETA', 'ALPHA', 'DEMO', 'TRIAL',
            'PREMIUM', 'PRO', 'PLUS', 'BASIC', 'STANDARD', 'DELUXE', 'ULTIMATE',
            'EXCLUSIVE', 'LIMITED', 'SPECIAL', 'RARE', 'EPIC', 'LEGENDARY',
            'COMMON', 'UNCOMMON', 'RARE', 'MYTHIC', 'DIVINE', 'COSMIC', 'INFINITE'
        }
        
        # Common reward patterns to validate
        self.reward_patterns = [
            r'\d+\s*(?:minutes?|mins?|hours?|hrs?)\s*(?:of\s+)?(?:2x|3x|4x|5x|10x)\s*(?:EXP|XP|Experience)',
            r'\d+\s*(?:Gems?|Coins?|Cash|Money|Currency|Beli|Yen|Rell\s+Coins?)',
            r'\d+\s*(?:Spins?|Rerolls?|Rolls?)',
            r'\d+\s*(?:Items?|Rewards?|Prizes?)',
            r'(?:Free|Bonus|Extra)\s+(?:Rewards?|Items?|Spins?|Gems?)',
            r'(?:Unlocks?|Gives?|Provides?)\s+(?:the\s+)?["\']?[^"\']+["\']?',
            r'(?:Vehicle|Car|Skin|Outfit|Accessory|Weapon|Tool)',
            r'(?:Trophies?|Points?|Stars?|Hearts?|Likes?)'
        ]

    def validate_code_format(self, code: str, game_type: str = 'roblox_general') -> bool:
        """Validate code format using strict regex patterns."""
        if not code or not isinstance(code, str):
            return False
            
        # Clean the code
        code = code.strip().upper()
        
        # Check length
        if len(code) < 3 or len(code) > 25:
            return False
            
        # Check against deny-list
        if code in self.deny_list:
            return False
            
        # Check pattern for specific game type
        pattern = self.code_patterns.get(game_type, self.code_patterns['roblox_general'])
        if not re.match(pattern, code):
            return False
            
        # Must contain at least one digit OR underscore OR hyphen
        if not (re.search(r'[0-9]', code) or '_' in code or '-' in code):
            return False
            
        # Check for valid gaming keywords (optional but preferred)
        has_valid_keyword = any(keyword in code for keyword in self.valid_keywords)
        
        return True

    def validate_reward_format(self, reward: str) -> bool:
        """Validate reward description format."""
        if not reward or not isinstance(reward, str):
            return False
            
        reward = reward.strip()
        
        # Check length
        if len(reward) < 3 or len(reward) > 100:
            return False
            
        # Check for valid reward patterns
        for pattern in self.reward_patterns:
            if re.search(pattern, reward, re.IGNORECASE):
                return True
                
        # Fallback: check for common reward words
        reward_words = ['reward', 'gem', 'coin', 'cash', 'spin', 'item', 'exp', 'xp', 'free', 'bonus']
        return any(word in reward.lower() for word in reward_words)

    def extract_and_validate_codes(self, text: str, game_type: str = 'roblox_general') -> List[str]:
        """Extract and validate codes from text using strict patterns."""
        if not text:
            return []
            
        # Find potential code candidates
        candidates = re.findall(r'[A-Z0-9_\-!]{3,25}', text.upper())
        
        valid_codes = []
        for candidate in candidates:
            if self.validate_code_format(candidate, game_type):
                valid_codes.append(candidate)
                
        return list(set(valid_codes))  # Remove duplicates

    def validate_code_data(self, code_data: Dict) -> Tuple[bool, List[str]]:
        """Validate a complete code data structure."""
        errors = []
        
        # Check required fields
        if 'code' not in code_data:
            errors.append("Missing 'code' field")
            return False, errors
            
        if 'reward' not in code_data:
            errors.append("Missing 'reward' field")
            return False, errors
            
        # Validate code format
        if not self.validate_code_format(code_data['code']):
            errors.append(f"Invalid code format: {code_data['code']}")
            
        # Validate reward format
        if not self.validate_reward_format(code_data['reward']):
            errors.append(f"Invalid reward format: {code_data['reward']}")
            
        # Validate source (optional but preferred)
        if 'source' not in code_data:
            code_data['source'] = 'Unknown'
            
        return len(errors) == 0, errors

    def deduplicate_codes(self, codes_list: List[Dict]) -> List[Dict]:
        """Remove duplicate codes while preserving the best quality entry."""
        seen_codes = {}
        
        for code_data in codes_list:
            code = code_data.get('code', '').upper()
            
            if code not in seen_codes:
                seen_codes[code] = code_data
            else:
                # Keep the one with better reward description
                existing = seen_codes[code]
                if len(code_data.get('reward', '')) > len(existing.get('reward', '')):
                    seen_codes[code] = code_data
                    
        return list(seen_codes.values())

    def filter_high_quality_codes(self, codes_list: List[Dict], min_quality_score: float = 0.7) -> List[Dict]:
        """Filter codes based on quality score."""
        quality_codes = []
        
        for code_data in codes_list:
            score = self.calculate_quality_score(code_data)
            if score >= min_quality_score:
                code_data['quality_score'] = score
                quality_codes.append(code_data)
                
        # Sort by quality score (highest first)
        quality_codes.sort(key=lambda x: x.get('quality_score', 0), reverse=True)
        
        return quality_codes

    def calculate_quality_score(self, code_data: Dict) -> float:
        """Calculate quality score for a code (0.0 to 1.0)."""
        score = 0.0
        
        # Code format quality (40%)
        if self.validate_code_format(code_data.get('code', '')):
            score += 0.4
            
        # Reward format quality (30%)
        if self.validate_reward_format(code_data.get('reward', '')):
            score += 0.3
            
        # Source quality (20%)
        source = code_data.get('source', '').lower()
        trusted_sources = ['progameguides', 'beebom', 'ign', 'dexerto', 'videogamer']
        if any(trusted in source for trusted in trusted_sources):
            score += 0.2
            
        # Code length quality (10%)
        code = code_data.get('code', '')
        if 5 <= len(code) <= 15:
            score += 0.1
            
        return score

    def validate_scraped_data(self, scraped_data: List[Dict], game_type: str = 'roblox_general') -> Dict:
        """Comprehensive validation of scraped data."""
        validation_result = {
            'total_codes': len(scraped_data),
            'valid_codes': [],
            'invalid_codes': [],
            'duplicates_removed': 0,
            'quality_filtered': [],
            'errors': [],
            'warnings': []
        }
        
        # Step 1: Validate each code
        for code_data in scraped_data:
            is_valid, errors = self.validate_code_data(code_data)
            if is_valid:
                validation_result['valid_codes'].append(code_data)
            else:
                validation_result['invalid_codes'].append({
                    'code_data': code_data,
                    'errors': errors
                })
                validation_result['errors'].extend(errors)
                
        # Step 2: Remove duplicates
        original_count = len(validation_result['valid_codes'])
        validation_result['valid_codes'] = self.deduplicate_codes(validation_result['valid_codes'])
        validation_result['duplicates_removed'] = original_count - len(validation_result['valid_codes'])
        
        # Step 3: Quality filtering
        validation_result['quality_filtered'] = self.filter_high_quality_codes(
            validation_result['valid_codes']
        )
        
        # Step 4: Generate warnings
        if len(validation_result['invalid_codes']) > len(validation_result['valid_codes']):
            validation_result['warnings'].append(
                f"More invalid codes ({len(validation_result['invalid_codes'])}) than valid codes ({len(validation_result['valid_codes'])})"
            )
            
        if validation_result['duplicates_removed'] > 0:
            validation_result['warnings'].append(
                f"Removed {validation_result['duplicates_removed']} duplicate codes"
            )
            
        return validation_result

    def log_validation_results(self, validation_result: Dict, game_name: str = "Unknown"):
        """Log validation results for debugging."""
        logger.info(f"=== Validation Results for {game_name} ===")
        logger.info(f"Total codes processed: {validation_result['total_codes']}")
        logger.info(f"Valid codes: {len(validation_result['valid_codes'])}")
        logger.info(f"Invalid codes: {len(validation_result['invalid_codes'])}")
        logger.info(f"Duplicates removed: {validation_result['duplicates_removed']}")
        logger.info(f"High quality codes: {len(validation_result['quality_filtered'])}")
        
        if validation_result['errors']:
            logger.warning(f"Validation errors: {len(validation_result['errors'])}")
            for error in validation_result['errors'][:5]:  # Show first 5 errors
                logger.warning(f"  - {error}")
                
        if validation_result['warnings']:
            logger.warning(f"Validation warnings: {len(validation_result['warnings'])}")
            for warning in validation_result['warnings']:
                logger.warning(f"  - {warning}")
                
        logger.info("=" * 50)

# Global validator instance
validator = CodeValidator()
