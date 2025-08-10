# 🎯 Precise Code Extraction System for ReversCodes

## Overview

This enhanced automation system implements **precise code extraction** with **section anchor detection**, **contextual proximity analysis**, and **confidence scoring** to extract only valid, redeemable codes while filtering out junk text like "30-DAY day money back guarantee."

## 🧠 Key Features

### 1. **Section Anchor Detection**
- Locates headings like `🎁 Active Codes`, `Active Codes`, `Codes`, `Redeemable Codes`
- Searches through `<h1>`-`<h6>`, `<strong>`, and `<b>` tags
- Supports multiple variations and formats

### 2. **Contextual Proximity Extraction**
- Extracts codes from list items (`<li>`) within 2-3 sibling elements of section anchors
- Looks for `<ul>`, `<ol>`, and `<div>` containers near headings
- Prioritizes structured content over random text

### 3. **Marketing Phrase Blacklist**
- Filters out 40+ common marketing phrases:
  - "30-DAY day money back guarantee"
  - "Click here"
  - "Terms apply"
  - "Limited time offer"
  - "Follow us on social media"
  - And many more...

### 4. **Confidence Scoring System**
- **High Confidence (0.7+)**: Perfect format, optimal length, contains numbers/underscores
- **Medium Confidence (0.4-0.7)**: Good format, reasonable length
- **Low Confidence (<0.4)**: Poor format, too short/long, or suspicious content

### 5. **Strict Code Validation**
```python
# Validates codes like:
✅ UPDATE20          # Valid: Contains numbers, proper length
✅ SECRET_ADMIN      # Valid: Contains underscore, proper format
❌ THE              # Invalid: Deny-list word
❌ ABC              # Invalid: Too short, no numbers/underscores
❌ VERYLONGCODENAMETHATEXCEEDSTWENTYFIVE  # Invalid: Too long
```

## 📁 File Structure

```
├── precise_code_extractor.py      # Core extraction logic
├── enhanced_precise_scraper.py    # Enhanced scraper integration
├── test_precise_extraction.py     # Test suite
└── PRECISE_EXTRACTION_README.md   # This file
```

## 🚀 Quick Start

### 1. Basic Usage

```python
from precise_code_extractor import extractor

# Extract codes from HTML content
html_content = """
<h2>🎁 Active Codes</h2>
<ul>
    <li><strong>UPDATE20</strong> - 2x EXP for 20 minutes</li>
    <li><strong>RELEASE2024</strong> - Free Spins</li>
</ul>
"""

results = extractor.extract_codes_from_html(html_content)
print(f"Active codes: {len(results['active_codes'])}")
```

### 2. Enhanced Scraper Usage

```python
from enhanced_precise_scraper import enhanced_scraper

# Scrape codes from multiple sources
sources = [
    {'name': 'ProGameGuides', 'url': 'https://progameguides.com/...'},
    {'name': 'Beebom', 'url': 'https://beebom.com/...'}
]

results = enhanced_scraper.scrape_game_codes_precise('jujutsu_shenanigans', sources)
enhanced_scraper.log_scraping_summary('jujutsu_shenanigans', results)
```

### 3. Run Tests

```bash
python test_precise_extraction.py
```

## 🔧 Configuration

### Section Anchors
Add new section anchors in `precise_code_extractor.py`:

```python
self.section_anchors = {
    'active_codes': [
        '🎁 Active Codes',
        'Active Codes',
        'Working Codes',
        # Add your custom anchors here
    ]
}
```

### Marketing Blacklist
Add new marketing phrases to filter out:

```python
self.marketing_blacklist = {
    '30-day day money back guarantee',
    'click here',
    # Add your custom phrases here
}
```

### Confidence Weights
Adjust confidence scoring weights:

```python
self.confidence_weights = {
    'format_perfect': 0.4,      # 40% weight for perfect format
    'length_optimal': 0.2,      # 20% weight for optimal length
    'contains_numbers': 0.15,   # 15% weight for containing numbers
    'contains_underscore': 0.1, # 10% weight for underscores
    'near_section_anchor': 0.15 # 15% weight for proximity to anchors
}
```

## 📊 Output Format

### ExtractedCode Object
```python
@dataclass
class ExtractedCode:
    code: str                    # The actual code (e.g., "UPDATE20")
    reward: str                  # Reward description (e.g., "2x EXP for 20 minutes")
    confidence: ConfidenceLevel  # HIGH, MEDIUM, or LOW
    source_section: str          # "active_codes", "expired_codes", etc.
    context: str                 # Surrounding text for debugging
```

### Results Structure
```python
{
    'active_codes': [ExtractedCode, ...],
    'expired_codes': [ExtractedCode, ...],
    'unknown_codes': [ExtractedCode, ...]
}
```

## 🎯 How It Solves Your Requirements

### ✅ Section Anchors
- **Finds**: `🎁 Active Codes`, `Active Codes`, `Codes`, `Redeemable Codes`
- **Locates**: `<h2>`, `<h3>`, `<strong>` tags with these exact texts
- **Extracts**: Only content near these anchors

### ✅ Nearby List Items
- **Searches**: Within 2-3 sibling elements of section anchors
- **Finds**: `<ul>`, `<ol>`, `<li>` elements
- **Extracts**: Codes from `<code>`, `<span>`, `<strong>` tags within list items

### ✅ Marketing Phrase Filtering
- **Blacklists**: 40+ marketing phrases including "30-DAY day money back guarantee"
- **Validates**: Each potential code against the blacklist
- **Rejects**: Any text containing marketing phrases

### ✅ Confidence Scoring
- **High Score**: All caps, 8-16 characters, alphanumeric with numbers/underscores
- **Medium Score**: Mixed case, reasonable length, good format
- **Low Score**: Contains spaces, punctuation, or marketing terms

## 🔍 Example Results

### Input HTML
```html
<h2>🎁 Active Codes</h2>
<ul>
    <li><strong>UPDATE20</strong> - 2x EXP for 20 minutes</li>
    <li><strong>RELEASE2024</strong> - Free Spins</li>
</ul>
<div class="ad">
    <p>30-DAY day money back guarantee! Click here!</p>
</div>
```

### Output
```python
{
    'active_codes': [
        ExtractedCode(
            code='UPDATE20',
            reward='2x EXP for 20 minutes',
            confidence=ConfidenceLevel.HIGH,
            source_section='active_codes',
            context='UPDATE20 - 2x EXP for 20 minutes'
        ),
        ExtractedCode(
            code='RELEASE2024',
            reward='Free Spins',
            confidence=ConfidenceLevel.HIGH,
            source_section='active_codes',
            context='RELEASE2024 - Free Spins'
        )
    ],
    'expired_codes': [],
    'unknown_codes': []
}
```

## 🚨 Marketing Phrases Filtered Out

The system automatically filters out these and 40+ other marketing phrases:

- "30-DAY day money back guarantee"
- "Click here"
- "Terms apply"
- "Limited time offer"
- "Follow us on social media"
- "Subscribe to our newsletter"
- "Join our discord"
- "Like us on facebook"
- "Share this page"
- "Download now"
- "Get it now"
- "Buy now"
- "Free trial"
- "Money back guarantee"
- "Satisfaction guaranteed"
- "No risk"
- "Act now"
- "Don't miss out"
- "Exclusive offer"
- "Special deal"
- "Discount code"
- "Promo code"
- "Coupon code"
- "Sale"
- "Clearance"
- "Limited edition"
- "While supplies last"
- "Quantities limited"
- "First come first served"
- "Hurry up"
- "Don't wait"
- "Time is running out"

## 🔧 Integration with Existing System

### Replace Old Scraper
```python
# OLD WAY
from improved_scraper import ImprovedGamingScraper
scraper = ImprovedGamingScraper()
results = scraper.scrape_game_codes_improved(game_key, sources)

# NEW WAY
from enhanced_precise_scraper import enhanced_scraper
results = enhanced_scraper.scrape_game_codes_precise(game_key, sources)
```

### Enhanced Validation
```python
# The new system provides better validation
quality_analysis = enhanced_scraper.analyze_extraction_quality(results)
print(f"Quality score: {quality_analysis['quality_score']:.2f}")
```

## 📈 Benefits

1. **Higher Accuracy**: Only extracts codes from proper sections
2. **Better Filtering**: Eliminates marketing junk and UI text
3. **Confidence Scoring**: Know which codes are most reliable
4. **Contextual Awareness**: Understands page structure
5. **Extensible**: Easy to add new anchors and blacklist phrases
6. **Compatible**: Works with existing scraper infrastructure

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_precise_extraction.py
```

This will test:
- Section anchor detection
- Marketing phrase filtering
- Confidence scoring
- Code validation
- HTML parsing

## 🎯 Next Steps

1. **Test with Real Data**: Run against actual gaming sites
2. **Tune Confidence Weights**: Adjust based on your needs
3. **Add Custom Anchors**: Include site-specific section headers
4. **Expand Blacklist**: Add more marketing phrases as needed
5. **Integrate**: Replace existing scraper in your automation pipeline

This system provides the precise, contextual code extraction you requested while maintaining compatibility with your existing infrastructure.
