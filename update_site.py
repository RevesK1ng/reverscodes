#!/usr/bin/env python3
"""
ReversCodes Website Content Updater
Scrapes gaming data from multiple sources and updates the website HTML file.
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GamingDataScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.html_file_path = "ReversCodes/index.html"
        
    def scrape_roblox_codes(self) -> List[Dict]:
        """Scrape Roblox game codes from multiple sources."""
        roblox_codes = []
        
        sources = [
            {
                'url': 'https://progameguides.com/roblox/roblox-game-codes/',
                'name': 'Pro Game Guides'
            },
            {
                'url': 'https://www.videogamer.com/guides/roblox-codes-pages/',
                'name': 'VideoGamer'
            },
            {
                'url': 'https://stealthygaming.com/category/roblox/roblox-codes/',
                'name': 'Stealthy Gaming'
            }
        ]
        
        for source in sources:
            try:
                logger.info(f"Scraping Roblox codes from {source['name']}")
                response = self.session.get(source['url'], timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract game codes (this is a simplified approach)
                # In practice, you'd need to customize selectors for each site
                code_elements = soup.find_all(['code', 'pre', 'span'], class_=re.compile(r'code|promo|redeem'))
                
                for element in code_elements[:5]:  # Limit to 5 codes per source
                    code_text = element.get_text().strip()
                    if len(code_text) > 3 and len(code_text) < 50:  # Reasonable code length
                        roblox_codes.append({
                            'code': code_text,
                            'game': 'Unknown Game',  # Would need more sophisticated parsing
                            'source': source['name'],
                            'url': source['url']
                        })
                
                time.sleep(random.uniform(1, 3))  # Be respectful
                
            except Exception as e:
                logger.error(f"Failed to scrape {source['name']}: {str(e)}")
        
        return roblox_codes[:15]  # Return top 15 codes
    
    def scrape_gta6_news(self) -> List[Dict]:
        """Scrape GTA 6 news from multiple sources."""
        gta6_news = []
        
        sources = [
            {
                'url': 'https://www.newsnow.com/us/Entertainment/Gaming/GTA+6',
                'name': 'NewsNow'
            },
            {
                'url': 'https://techwiser.com/gta-6-could-become-a-creator-platform-rockstar-meets-with-fortnite-and-roblox-communities/',
                'name': 'Techwiser'
            },
            {
                'url': 'https://www.gamingbible.com/news/gta-6-online-sounds-like-fortnite-605633-20250218',
                'name': 'GamingBible'
            },
            {
                'url': 'https://www.uniladtech.com/gaming/new-gta-6-rumor-leaves-everyone-worrying-about-the-future-of-fortnite-068335-20250218',
                'name': 'Unilad Tech'
            }
        ]
        
        for source in sources:
            try:
                logger.info(f"Scraping GTA 6 news from {source['name']}")
                response = self.session.get(source['url'], timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract headlines and links
                headlines = soup.find_all(['h1', 'h2', 'h3'], class_=re.compile(r'title|headline|article'))
                
                for headline in headlines[:3]:  # Limit to 3 headlines per source
                    title = headline.get_text().strip()
                    if 'gta' in title.lower() or 'grand theft auto' in title.lower():
                        link = headline.find_parent('a')
                        url = link.get('href') if link else source['url']
                        if not url.startswith('http'):
                            url = urljoin(source['url'], url)
                        
                        gta6_news.append({
                            'title': title,
                            'url': url,
                            'source': source['name']
                        })
                
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                logger.error(f"Failed to scrape GTA 6 news from {source['name']}: {str(e)}")
        
        return gta6_news[:6]  # Return top 6 headlines
    
    def scrape_fortnite_news(self) -> List[Dict]:
        """Scrape Fortnite news from official and unofficial sources."""
        fortnite_news = []
        
        sources = [
            {
                'url': 'https://www.epicgames.com/fortnite/en-US/news',
                'name': 'Epic Games Official'
            }
        ]
        
        for source in sources:
            try:
                logger.info(f"Scraping Fortnite news from {source['name']}")
                response = self.session.get(source['url'], timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract news items
                news_items = soup.find_all(['article', 'div'], class_=re.compile(r'news|article|post'))
                
                for item in news_items[:5]:  # Limit to 5 news items
                    title_elem = item.find(['h1', 'h2', 'h3', 'h4'])
                    if title_elem:
                        title = title_elem.get_text().strip()
                        link = item.find('a')
                        url = link.get('href') if link else source['url']
                        if not url.startswith('http'):
                            url = urljoin(source['url'], url)
                        
                        fortnite_news.append({
                            'title': title,
                            'url': url,
                            'source': source['name']
                        })
                
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                logger.error(f"Failed to scrape Fortnite news from {source['name']}: {str(e)}")
        
        return fortnite_news[:5]  # Return top 5 news items
    
    def scrape_cod_news(self) -> List[Dict]:
        """Scrape Call of Duty news from official sources."""
        cod_news = []
        
        sources = [
            {
                'url': 'https://www.callofduty.com/news',
                'name': 'Call of Duty Official'
            }
        ]
        
        for source in sources:
            try:
                logger.info(f"Scraping Call of Duty news from {source['name']}")
                response = self.session.get(source['url'], timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract news items
                news_items = soup.find_all(['article', 'div'], class_=re.compile(r'news|article|post'))
                
                for item in news_items[:5]:  # Limit to 5 news items
                    title_elem = item.find(['h1', 'h2', 'h3', 'h4'])
                    if title_elem:
                        title = title_elem.get_text().strip()
                        link = item.find('a')
                        url = link.get('href') if link else source['url']
                        if not url.startswith('http'):
                            url = urljoin(source['url'], url)
                        
                        cod_news.append({
                            'title': title,
                            'url': url,
                            'source': source['name']
                        })
                
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                logger.error(f"Failed to scrape Call of Duty news from {source['name']}: {str(e)}")
        
        return cod_news[:5]  # Return top 5 news items
    
    def generate_roblox_codes_html(self, codes: List[Dict]) -> str:
        """Generate HTML for Roblox codes section."""
        if not codes:
            return '<p>No codes available at the moment. Check back soon!</p>'
        
        html = '<div class="codes-grid">'
        for code in codes:
            html += f'''
            <div class="code-card">
                <div class="code-header">
                    <span class="code-text">{code['code']}</span>
                    <span class="code-game">{code['game']}</span>
                </div>
                <div class="code-source">
                    <small>Source: {code['source']}</small>
                </div>
            </div>
            '''
        html += '</div>'
        return html
    
    def generate_news_html(self, news_items: List[Dict], category: str) -> str:
        """Generate HTML for news sections."""
        if not news_items:
            return f'<p>No {category} news available at the moment. Check back soon!</p>'
        
        html = '<div class="news-grid">'
        for item in news_items:
            html += f'''
            <div class="news-card">
                <h4 class="news-title">
                    <a href="{item['url']}" target="_blank" rel="noopener">
                        {item['title']}
                    </a>
                </h4>
                <div class="news-source">
                    <small>Source: {item['source']}</small>
                </div>
            </div>
            '''
        html += '</div>'
        return html
    
    def update_html_file(self, roblox_codes: List[Dict], gta6_news: List[Dict], 
                        fortnite_news: List[Dict], cod_news: List[Dict]) -> bool:
        """Update the HTML file with new content."""
        try:
            # Read the HTML file
            with open(self.html_file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Generate new content
            roblox_html = self.generate_roblox_codes_html(roblox_codes)
            gta6_html = self.generate_news_html(gta6_news, 'GTA 6')
            fortnite_html = self.generate_news_html(fortnite_news, 'Fortnite')
            cod_html = self.generate_news_html(cod_news, 'Call of Duty')
            
            # Update the HTML content
            # Note: Since there are no placeholder tags, we'll add them first
            # and then replace them with actual content
            
            # Add placeholder tags if they don't exist
            if '{{roblox_codes}}' not in html_content:
                # Find a good place to insert the codes section
                # Look for the games section
                games_section = html_content.find('id="games"')
                if games_section != -1:
                    # Insert placeholder after the games section
                    insert_pos = html_content.find('</section>', games_section) + 10
                    html_content = html_content[:insert_pos] + '\n        <!-- Dynamic Roblox Codes Section -->\n        <section id="dynamic-codes" class="codes-section">\n            <div class="container">\n                <div class="section-header">\n                    <h2 class="section-title">🎁 Latest Roblox Codes</h2>\n                    <p class="section-subtitle">Fresh codes updated daily</p>\n                </div>\n                {{roblox_codes}}\n            </div>\n        </section>\n' + html_content[insert_pos:]
            
            if '{{gta6_news}}' not in html_content:
                # Find trending section and add GTA 6 news
                trending_section = html_content.find('id="trending"')
                if trending_section != -1:
                    insert_pos = html_content.find('</section>', trending_section) + 10
                    html_content = html_content[:insert_pos] + '\n        <!-- Dynamic GTA 6 News Section -->\n        <section id="gta6-news" class="news-section">\n            <div class="container">\n                <div class="section-header">\n                    <h2 class="section-title">🎮 GTA 6 Latest News</h2>\n                    <p class="section-subtitle">Stay updated with the latest GTA 6 developments</p>\n                </div>\n                {{gta6_news}}\n            </div>\n        </section>\n' + html_content[insert_pos:]
            
            if '{{fortnite_news}}' not in html_content:
                # Add Fortnite news section
                gta6_news_section = html_content.find('id="gta6-news"')
                if gta6_news_section != -1:
                    insert_pos = html_content.find('</section>', gta6_news_section) + 10
                    html_content = html_content[:insert_pos] + '\n        <!-- Dynamic Fortnite News Section -->\n        <section id="fortnite-news" class="news-section">\n            <div class="container">\n                <div class="section-header">\n                    <h2 class="section-title">⚡ Fortnite Latest News</h2>\n                    <p class="section-subtitle">Latest updates from the battle royale</p>\n                </div>\n                {{fortnite_news}}\n            </div>\n        </section>\n' + html_content[insert_pos:]
            
            if '{{cod_news}}' not in html_content:
                # Add Call of Duty news section
                fortnite_news_section = html_content.find('id="fortnite-news"')
                if fortnite_news_section != -1:
                    insert_pos = html_content.find('</section>', fortnite_news_section) + 10
                    html_content = html_content[:insert_pos] + '\n        <!-- Dynamic Call of Duty News Section -->\n        <section id="cod-news" class="news-section">\n            <div class="container">\n                <div class="section-header">\n                    <h2 class="section-title">🏆 Call of Duty Latest News</h2>\n                    <p class="section-subtitle">Latest updates from the COD universe</p>\n                </div>\n                {{cod_news}}\n            </div>\n        </section>\n' + html_content[insert_pos:]
            
            # Replace placeholders with actual content
            html_content = html_content.replace('{{roblox_codes}}', roblox_html)
            html_content = html_content.replace('{{gta6_news}}', gta6_html)
            html_content = html_content.replace('{{fortnite_news}}', fortnite_html)
            html_content = html_content.replace('{{cod_news}}', cod_html)
            
            # Add last updated timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            html_content = html_content.replace(
                '<title>ReversCodes Hub',
                f'<title>ReversCodes Hub (Updated: {timestamp})'
            )
            
            # Write the updated HTML file
            with open(self.html_file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"Successfully updated {self.html_file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update HTML file: {str(e)}")
            return False
    
    def run_update(self):
        """Main method to run the complete update process."""
        logger.info("Starting website content update...")
        
        try:
            # Scrape all data
            logger.info("Scraping Roblox codes...")
            roblox_codes = self.scrape_roblox_codes()
            logger.info(f"Found {len(roblox_codes)} Roblox codes")
            
            logger.info("Scraping GTA 6 news...")
            gta6_news = self.scrape_gta6_news()
            logger.info(f"Found {len(gta6_news)} GTA 6 news items")
            
            logger.info("Scraping Fortnite news...")
            fortnite_news = self.scrape_fortnite_news()
            logger.info(f"Found {len(fortnite_news)} Fortnite news items")
            
            logger.info("Scraping Call of Duty news...")
            cod_news = self.scrape_cod_news()
            logger.info(f"Found {len(cod_news)} Call of Duty news items")
            
            # Update the HTML file
            success = self.update_html_file(roblox_codes, gta6_news, fortnite_news, cod_news)
            
            if success:
                logger.info("Website update completed successfully!")
                
                # Log summary
                summary = {
                    'timestamp': datetime.now().isoformat(),
                    'roblox_codes_count': len(roblox_codes),
                    'gta6_news_count': len(gta6_news),
                    'fortnite_news_count': len(fortnite_news),
                    'cod_news_count': len(cod_news),
                    'status': 'success'
                }
                
                with open('update_summary.json', 'w') as f:
                    json.dump(summary, f, indent=2)
                    
            else:
                logger.error("Website update failed!")
                
        except Exception as e:
            logger.error(f"Update process failed: {str(e)}")

def main():
    """Main function to run the scraper."""
    scraper = GamingDataScraper()
    scraper.run_update()

if __name__ == "__main__":
    main()
