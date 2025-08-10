#!/usr/bin/env python3
"""
Enhanced Precise Scraper for ReversCodes
Provides precise code extraction with quality analysis
"""

import requests
import re
import logging
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime
import json
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Load blacklist for known junk phrases
        self.blacklist = self._load_blacklist()
        
        # Common UI labels to ignore
        self.ui_labels = {
            'copy', 'redeem', 'claim', 'claim reward', 'use code', 'enter code',
            'click here', 'terms apply', 'limited time', 'follow us', 'social media',
            'money back', 'guarantee', '30-day', 'last updated', 'update', 'news'
        }
        
        # Years and date patterns to ignore
        self.date_patterns = [
            r'\b(19|20)\d{2}\b',  # Years like 2025, 2021
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b',  # Dates
            r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # MM/DD/YYYY format
            r'\b\d{1,2}-\d{1,2}-\d{4}\b'   # MM-DD-YYYY format
        ]
        
        # Common marketing phrases to filter out
        self.marketing_phrases = ['FREE', 'NEW', 'UPDATE', 'RELEASE', 'LATEST', 'HOT', 'POPULAR']

    def _load_blacklist(self) -> List[str]:
        """Load blacklist from file or use default."""
        blacklist_file = 'code_blacklist.json'
        if os.path.exists(blacklist_file):
            try:
                with open(blacklist_file, 'r') as f:
                    data = json.load(f)
                    return data.get('blacklist', [])
            except:
                pass
        
        # Default blacklist
        return [
            "30-Day", "Click here", "Terms apply", "Limited time offer",
            "Follow us on social media", "Money back guarantee", "Last updated",
            "NEW", "UPDATE", "RELEASE", "LATEST", "HOT", "POPULAR"
        ]

    def scrape_game_codes_precise(self, game_key: str, sources: List[Dict]) -> Dict:
        """Scrape game codes with precise filtering."""
        logger.info(f"Starting precise scraping for {game_key}")
        
        all_codes = []
        successful_sources = 0
        
        for source in sources:
            url = source['url']
            source_name = source['name']
            
            logger.info(f"Scraping {source_name}: {url}")
            codes = self._scrape_single_source(url, source_name)
            
            if codes:
                all_codes.extend(codes)
                successful_sources += 1
                logger.info(f"Found {len(codes)} codes from {source_name}")
            else:
                logger.warning(f"No codes found from {source_name}")
        
        # Apply precise filtering and categorization
        filtered_codes = self._apply_precise_filtering(all_codes)
        unique_codes = self._deduplicate_codes(filtered_codes)
        
        # Separate into active and expired codes
        active_codes = []
        expired_codes = []
        
        for code_data in unique_codes:
            if self._is_potentially_expired(code_data['code']):
                expired_codes.append(code_data)
            else:
                active_codes.append(code_data)
        
        # Calculate confidence scores
        for code_data in active_codes:
            code_data['confidence_score'] = self._calculate_confidence_score(code_data)
        
        # Sort by confidence score (highest first)
        active_codes.sort(key=lambda x: x.get('confidence_score', 0), reverse=True)
        
        result = {
            'game_key': game_key,
            'total_codes': len(unique_codes),
            'active_codes': active_codes,
            'expired_codes': expired_codes,
            'successful_sources': successful_sources,
            'total_sources': len(sources),
            'codes': unique_codes,  # Keep for backward compatibility
            'scraped_at': datetime.now().isoformat(),
            'extraction_stats': {
                'total_found': len(all_codes),
                'filtered_out': len(all_codes) - len(filtered_codes),
                'total_active': len(active_codes),
                'total_expired': len(expired_codes),
                'high_confidence': len([c for c in active_codes if c.get('confidence_score', 0) >= 0.8]),
                'medium_confidence': len([c for c in active_codes if 0.5 <= c.get('confidence_score', 0) < 0.8]),
                'low_confidence': len([c for c in active_codes if c.get('confidence_score', 0) < 0.5])
            }
        }
        
        self.log_scraping_summary(game_key, result)
        return result

    def _scrape_single_source(self, url: str, source_name: str) -> List[Dict]:
        """Scrape codes from a single source with precise targeting."""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            codes = []
            
            # Strategy 1: Target specific "Active Codes" sections
            section_codes = self._extract_from_code_sections(soup)
            codes.extend(section_codes)
            
            # Strategy 2: Look for code patterns in text with strict validation
            text_codes = self._extract_codes_from_text_precise(soup.get_text())
            codes.extend(text_codes)
            
            # Strategy 3: Look for code-like elements with validation
            element_codes = self._extract_codes_from_elements_precise(soup)
            codes.extend(element_codes)
            
            # Add source information
            for code_data in codes:
                code_data['source'] = source_name
                code_data['url'] = url
            
            return codes
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return []

    def _extract_from_code_sections(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract codes from sections specifically labeled as code sections."""
        codes = []
        
        # Look for headings that indicate code sections
        code_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
        
        for heading in code_headings:
            heading_text = heading.get_text().strip().lower()
            
            # Check if this heading indicates a code section
            if any(keyword in heading_text for keyword in ['active codes', 'working codes', 'latest codes', 'redeemable codes', 'codes']):
                # Look for codes in the next few sibling elements
                codes.extend(self._extract_codes_from_section(heading))
        
        return codes

    def _extract_codes_from_section(self, heading_element) -> List[Dict]:
        """Extract codes from a specific section starting from a heading."""
        codes = []
        
        # Look at the next few sibling elements for codes
        current = heading_element
        for _ in range(5):  # Check next 5 siblings
            current = current.find_next_sibling()
            if not current:
                break
            
            # Look for list items, paragraphs, or spans that might contain codes
            code_elements = current.find_all(['li', 'p', 'span', 'div'])
            
            for element in code_elements:
                text = element.get_text().strip()
                if text and self._is_valid_code_precise(text):
                    reward = self._extract_reward_from_context(text, text)
                    codes.append({
                        'code': text.upper(),
                        'reward': reward,
                        'extraction_method': 'code_section_targeting'
                    })
        
        return codes

    def _extract_codes_from_text_precise(self, text: str) -> List[Dict]:
        """Extract codes from text using precise regex patterns."""
        codes = []
        
        # Use the exact regex pattern you specified: ^[A-Z0-9\-]{5,20}$
        # But we'll also allow some variations for real Roblox codes
        patterns = [
            r'\b[A-Z0-9\-]{5,20}\b',  # Your specified pattern
            r'\b[A-Z0-9_\-!]{5,20}\b',  # Allow underscores and exclamation marks (common in Roblox)
        ]
        
        lines = text.split('\n')
        
        for line in lines:
            for pattern in patterns:
                matches = re.findall(pattern, line)
                for match in matches:
                    # Apply strict validation
                    if self._is_valid_code_precise(match):
                        reward = self._extract_reward_from_context(line, match)
                        codes.append({
                            'code': match.upper(),
                            'reward': reward,
                            'extraction_method': 'text_pattern_precise'
                        })
        
        return codes

    def _extract_codes_from_elements_precise(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract codes from HTML elements with precise validation."""
        codes = []
        
        # Look for elements that might contain codes
        code_elements = soup.find_all(['code', 'pre', 'span', 'div', 'p'], 
                                    class_=re.compile(r'code|promo|reward', re.I))
        
        for element in code_elements:
            text = element.get_text().strip()
            if text and self._is_valid_code_precise(text):
                reward = self._extract_reward_from_context(text, text)
                codes.append({
                    'code': text.upper(),
                    'reward': reward,
                    'extraction_method': 'element_search_precise'
                })
        
        return codes

    def _is_valid_code_precise(self, text: str) -> bool:
        """Strict validation for real, redeemable codes."""
        if not text:
            return False
        
        # Must match the exact pattern you specified
        if not re.match(r'^[A-Z0-9\-]{5,20}$', text):
            return False
        
        # Additional checks to filter out junk
        
        # 1. Check against blacklist (but allow if it's part of a longer code)
        text_upper = text.upper()
        for blacklisted in self.blacklist:
            if blacklisted.upper() == text_upper:  # Exact match only
                return False
        
        # 2. Check against UI labels
        if text_upper in self.ui_labels:
            return False
        
        # 3. Check against date patterns
        for pattern in self.date_patterns:
            if re.search(pattern, text):
                return False
        
        # 4. Must contain at least one letter (not just numbers)
        if not re.search(r'[A-Z]', text):
            return False
        
        # 5. Must contain at least one digit OR be a legitimate-looking code
        # This allows codes like "NEWCODE" while filtering out pure marketing words
        has_digit = bool(re.search(r'[0-9]', text))
        is_legitimate_code = len(text) >= 6 and text_upper not in self.marketing_phrases
        
        if not has_digit and not is_legitimate_code:
            return False
        
        # 6. Avoid common marketing phrases (only if they're the entire text)
        if text_upper in self.marketing_phrases:
            return False
        
        # 7. Check for reasonable character distribution
        # Shouldn't be all the same character
        if len(set(text)) == 1:
            return False
        
        # 8. Shouldn't be a sequence (like 12345)
        if self._is_sequence(text):
            return False
        
        # 9. Additional quality check: if it starts with a marketing word, it should be longer
        # This allows codes like "NEWCODE" but filters out just "NEW"
        for phrase in self.marketing_phrases:
            if text_upper.startswith(phrase) and len(text) == len(phrase):
                return False
        
        return True

    def _is_sequence(self, text: str) -> bool:
        """Check if text is a simple sequence like 12345 or ABCDE."""
        if len(text) < 3:
            return False
        
        # Check for numeric sequences
        if text.isdigit():
            for i in range(1, len(text)):
                if int(text[i]) != int(text[i-1]) + 1:
                    return False
            return True
        
        # Check for alphabetic sequences
        if text.isalpha():
            for i in range(1, len(text)):
                if ord(text[i]) != ord(text[i-1]) + 1:
                    return False
            return True
        
        return False

    def _extract_reward_from_context(self, line: str, code: str) -> str:
        """Extract reward information from the context around a code."""
        # Common reward patterns
        reward_patterns = [
            r'(\d+\s*(?:Gems?|Coins?|Cash|Money|Currency|Beli|Yen|Rell\s+Coins?))',
            r'(\d+\s*(?:Spins?|Rerolls?|Rolls?))',
            r'(\d+\s*(?:minutes?|mins?|hours?|hrs?)\s*(?:of\s+)?(?:2x|3x|4x|5x|10x)\s*(?:EXP|XP|Experience))',
            r'((?:Free|Bonus|Extra)\s+(?:Rewards?|Items?|Spins?|Gems?))',
            r'((?:Vehicle|Car|Skin|Outfit|Accessory|Weapon|Tool))'
        ]
        
        for pattern in reward_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                return match.group(1)
        
        # If no specific reward found, look for common indicators
        if any(word in line.upper() for word in ['GEMS', 'COINS', 'SPINS', 'EXP', 'XP', 'REWARDS']):
            return 'Free Rewards'
        
        return 'Free Rewards'

    def _apply_precise_filtering(self, codes: List[Dict]) -> List[Dict]:
        """Apply additional filtering to remove low-quality codes."""
        filtered_codes = []
        
        for code_data in codes:
            code = code_data['code']
            
            # Skip if already filtered by validation
            if not self._is_valid_code_precise(code):
                continue
            
            # Additional quality checks
            if self._is_high_quality_code(code):
                filtered_codes.append(code_data)
        
        return filtered_codes

    def _is_high_quality_code(self, code: str) -> bool:
        """Check if a code meets high quality standards."""
        # High quality codes should:
        # 1. Have good length (8-16 characters is ideal)
        if not (8 <= len(code) <= 16):
            return False
        
        # 2. Have good character variety
        char_variety = len(set(code)) / len(code)
        if char_variety < 0.6:  # At least 60% unique characters
            return False
        
        # 3. Not be too repetitive
        if self._has_repetitive_pattern(code):
            return False
        
        return True

    def _has_repetitive_pattern(self, code: str) -> bool:
        """Check if code has repetitive patterns."""
        if len(code) < 6:
            return False
        
        # Check for repeated substrings
        for length in range(2, len(code) // 2 + 1):
            for i in range(len(code) - length + 1):
                substring = code[i:i+length]
                if code.count(substring) > 2:  # Appears more than twice
                    return True
        
        return False

    def _calculate_confidence_score(self, code_data: Dict) -> float:
        """Calculate confidence score for a code (0.0 to 1.0)."""
        code = code_data['code']
        score = 0.0
        
        # Length score (8-16 characters is ideal)
        if 8 <= len(code) <= 16:
            score += 0.3
        elif 5 <= len(code) <= 20:
            score += 0.2
        else:
            score += 0.1
        
        # Character variety score
        char_variety = len(set(code)) / len(code)
        if char_variety >= 0.8:
            score += 0.3
        elif char_variety >= 0.6:
            score += 0.2
        else:
            score += 0.1
        
        # Pattern quality score
        if not self._is_sequence(code) and not self._has_repetitive_pattern(code):
            score += 0.2
        else:
            score += 0.1
        
        # Extraction method score
        method = code_data.get('extraction_method', '')
        if 'code_section_targeting' in method:
            score += 0.2
        elif 'precise' in method:
            score += 0.1
        
        return min(score, 1.0)

    def _is_potentially_expired(self, code: str) -> bool:
        """Check if a code might be expired based on common patterns."""
        # Common patterns that suggest expired codes
        expired_patterns = [
            r'EXPIRED', r'OLD', r'OUTDATED', r'INVALID', r'USED',
            r'CLAIMED', r'ENDED', r'FINISHED', r'CLOSED', r'STOPPED'
        ]
        
        code_upper = code.upper()
        for pattern in expired_patterns:
            if re.search(pattern, code_upper):
                return True
        
        return False

    def _deduplicate_codes(self, codes: List[Dict]) -> List[Dict]:
        """Remove duplicate codes while preserving source information."""
        seen = set()
        unique_codes = []
        
        for code_data in codes:
            code = code_data['code']
            if code not in seen:
                seen.add(code)
                unique_codes.append(code_data)
        
        return unique_codes

    def log_scraping_summary(self, game_key: str, result: Dict):
        """Log a summary of the scraping results."""
        logger.info(f"Scraping summary for {game_key}:")
        logger.info(f"  - Total codes found: {result['total_codes']}")
        logger.info(f"  - Active codes: {len(result['active_codes'])}")
        logger.info(f"  - Expired codes: {len(result['expired_codes'])}")
        logger.info(f"  - High confidence: {result['extraction_stats']['high_confidence']}")
        logger.info(f"  - Medium confidence: {result['extraction_stats']['medium_confidence']}")
        logger.info(f"  - Low confidence: {result['extraction_stats']['low_confidence']}")
        logger.info(f"  - Successful sources: {result['successful_sources']}/{result['total_sources']}")
        logger.info(f"  - Scraped at: {result['scraped_at']}")

    def analyze_extraction_quality(self, result: Dict) -> Dict:
        """Analyze the quality of extracted data."""
        quality_score = 0.0
        issues = []
        
        # Score based on successful sources
        if result['total_sources'] > 0:
            source_success_rate = result['successful_sources'] / result['total_sources']
            quality_score += source_success_rate * 0.3  # 30% weight
            
            if source_success_rate < 0.5:
                issues.append("Low source success rate")
        
        # Score based on high-confidence codes
        high_conf_count = result['extraction_stats']['high_confidence']
        if high_conf_count >= 5:
            quality_score += 0.4  # 40% weight for high-confidence codes
        elif high_conf_count >= 2:
            quality_score += 0.3  # 30% weight for moderate high-confidence codes
        else:
            issues.append("Low high-confidence code count")
        
        # Score based on total active codes
        active_count = len(result['active_codes'])
        if active_count >= 8:
            quality_score += 0.3  # 30% weight for good code count
        elif active_count >= 3:
            quality_score += 0.2  # 20% weight for moderate code count
        else:
            issues.append("Low active code count")
        
        return {
            'quality_score': round(quality_score, 2),
            'issues': issues,
            'recommendation': 'Excellent' if quality_score >= 0.8 else 'Good' if quality_score >= 0.6 else 'Needs improvement'
        }

# Create the enhanced_scraper instance
enhanced_scraper = EnhancedScraper()
