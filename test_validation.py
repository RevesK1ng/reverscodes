#!/usr/bin/env python3
"""
Test Script for Code Validation Improvements
Demonstrates the fixes for automation issues.
"""

import json
from code_validator import validator
from improved_scraper import ImprovedGamingScraper

def test_code_validation():
    """Test the code validation system."""
    print("🧪 Testing Code Validation System")
    print("=" * 50)
    
    # Test cases for different scenarios
    test_cases = [
        # Valid codes
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Test'},
        {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Test'},
        {'code': 'BLOXFRUITS_UPDATE_20', 'reward': '2x EXP (20 minutes)', 'source': 'Test'},
        {'code': 'BADGUYS2', 'reward': 'Unlocks the "Betty Beater" vehicle', 'source': 'Test'},
        {'code': 'NASCAR100M', 'reward': '200 Trophies', 'source': 'Test'},
        
        # Invalid codes (should be rejected)
        {'code': 'THE', 'reward': 'Free Rewards', 'source': 'Test'},  # Deny-list word
        {'code': 'CODE', 'reward': 'Free Rewards', 'source': 'Test'},  # Deny-list word
        {'code': 'ABC', 'reward': 'Free Rewards', 'source': 'Test'},   # Too short
        {'code': 'VERYLONGCODENAMETHATEXCEEDSTWENTYFIVE', 'reward': 'Free Rewards', 'source': 'Test'},  # Too long
        {'code': 'abc123', 'reward': 'Free Rewards', 'source': 'Test'},  # Lowercase
        {'code': 'CODE@123', 'reward': 'Free Rewards', 'source': 'Test'},  # Invalid character
        {'code': 'ABCDEF', 'reward': 'Free Rewards', 'source': 'Test'},  # No numbers/underscores/hyphens
        
        # Invalid rewards
        {'code': 'VALID123', 'reward': '', 'source': 'Test'},  # Empty reward
        {'code': 'VALID123', 'reward': 'A', 'source': 'Test'},  # Too short
        {'code': 'VALID123', 'reward': 'A' * 101, 'source': 'Test'},  # Too long
    ]
    
    print("Testing individual code validation:")
    valid_count = 0
    invalid_count = 0
    
    for i, test_case in enumerate(test_cases, 1):
        is_valid, errors = validator.validate_code_data(test_case)
        status = "✅ VALID" if is_valid else "❌ INVALID"
        print(f"{i:2d}. {test_case['code']:<25} | {status:<12} | {test_case['reward']}")
        
        if not is_valid:
            print(f"     Errors: {', '.join(errors)}")
            
        if is_valid:
            valid_count += 1
        else:
            invalid_count += 1
    
    print(f"\nResults: {valid_count} valid, {invalid_count} invalid")
    print()

def test_duplicate_removal():
    """Test duplicate code removal."""
    print("🔄 Testing Duplicate Removal")
    print("=" * 50)
    
    # Test data with duplicates
    test_codes = [
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Source A'},
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Source B'},  # Duplicate
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes) - Better description', 'source': 'Source C'},  # Duplicate with better reward
        {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Source A'},
        {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Source B'},  # Duplicate
        {'code': 'NEW_CODE', 'reward': 'Free Rewards', 'source': 'Source A'},
    ]
    
    print("Before deduplication:")
    for code in test_codes:
        print(f"  {code['code']} - {code['reward']} ({code['source']})")
    
    deduplicated = validator.deduplicate_codes(test_codes)
    
    print("\nAfter deduplication:")
    for code in deduplicated:
        print(f"  {code['code']} - {code['reward']} ({code['source']})")
    
    print(f"\nRemoved {len(test_codes) - len(deduplicated)} duplicates")
    print()

def test_quality_filtering():
    """Test quality filtering system."""
    print("⭐ Testing Quality Filtering")
    print("=" * 50)
    
    # Test data with varying quality
    test_codes = [
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Pro Game Guides'},  # High quality
        {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Beebom'},  # High quality
        {'code': 'VALID123', 'reward': 'Free Rewards', 'source': 'Unknown'},  # Medium quality
        {'code': 'ABC123', 'reward': 'Rewards', 'source': 'Unknown'},  # Low quality
        {'code': 'TEST_CODE', 'reward': 'Free', 'source': 'Unknown'},  # Low quality
    ]
    
    print("All codes with quality scores:")
    for code in test_codes:
        score = validator.calculate_quality_score(code)
        print(f"  {code['code']:<15} | Score: {score:.2f} | {code['reward']} ({code['source']})")
    
    quality_codes = validator.filter_high_quality_codes(test_codes, min_quality_score=0.7)
    
    print(f"\nHigh quality codes (score >= 0.7):")
    for code in quality_codes:
        score = code.get('quality_score', 0)
        print(f"  {code['code']:<15} | Score: {score:.2f} | {code['reward']} ({code['source']})")
    
    print(f"\nFiltered out {len(test_codes) - len(quality_codes)} low-quality codes")
    print()

def test_comprehensive_validation():
    """Test comprehensive validation of scraped data."""
    print("🔍 Testing Comprehensive Validation")
    print("=" * 50)
    
    # Simulate scraped data with various issues
    scraped_data = [
        # Valid codes
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Pro Game Guides'},
        {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Beebom'},
        {'code': 'BLOXFRUITS_UPDATE_20', 'reward': '2x EXP (20 minutes)', 'source': 'IGN'},
        
        # Duplicates
        {'code': 'UPDATE20', 'reward': '2x EXP (20 minutes)', 'source': 'Another Source'},
        {'code': 'SECRET_ADMIN', 'reward': '20 minutes of 2x EXP', 'source': 'Yet Another Source'},
        
        # Invalid codes
        {'code': 'THE', 'reward': 'Free Rewards', 'source': 'Test'},
        {'code': 'CODE', 'reward': 'Free Rewards', 'source': 'Test'},
        {'code': 'ABC', 'reward': 'Free Rewards', 'source': 'Test'},
        {'code': 'VERYLONGCODENAMETHATEXCEEDSTWENTYFIVE', 'reward': 'Free Rewards', 'source': 'Test'},
        
        # Invalid rewards
        {'code': 'VALID123', 'reward': '', 'source': 'Test'},
        {'code': 'VALID456', 'reward': 'A', 'source': 'Test'},
    ]
    
    print("Input data:")
    for code in scraped_data:
        print(f"  {code['code']} - {code['reward']} ({code['source']})")
    
    # Run comprehensive validation
    validation_result = validator.validate_scraped_data(scraped_data, 'blox_fruits')
    
    print(f"\nValidation Results:")
    print(f"  Total codes processed: {validation_result['total_codes']}")
    print(f"  Valid codes: {len(validation_result['valid_codes'])}")
    print(f"  Invalid codes: {len(validation_result['invalid_codes'])}")
    print(f"  Duplicates removed: {validation_result['duplicates_removed']}")
    print(f"  High quality codes: {len(validation_result['quality_filtered'])}")
    
    if validation_result['errors']:
        print(f"\nErrors:")
        for error in validation_result['errors'][:5]:
            print(f"  - {error}")
    
    if validation_result['warnings']:
        print(f"\nWarnings:")
        for warning in validation_result['warnings']:
            print(f"  - {warning}")
    
    print(f"\nFinal high-quality codes:")
    for code in validation_result['quality_filtered']:
        score = code.get('quality_score', 0)
        print(f"  {code['code']:<20} | Score: {score:.2f} | {code['reward']} ({code['source']})")
    
    print()

def test_regex_patterns():
    """Test regex patterns for code extraction."""
    print("🔧 Testing Regex Patterns")
    print("=" * 50)
    
    # Test text with potential codes
    test_text = """
    Here are some codes:
    - UPDATE20 (2x EXP for 20 minutes)
    - SECRET_ADMIN (20 minutes of 2x EXP)
    - BLOXFRUITS_UPDATE_20 (2x EXP for 20 minutes)
    - BADGUYS2 (Unlocks the "Betty Beater" vehicle)
    - NASCAR100M (200 Trophies)
    
    Some invalid text:
    - THE (not a code)
    - CODE (not a code)
    - ABC (too short)
    - VERYLONGCODENAMETHATEXCEEDSTWENTYFIVE (too long)
    """
    
    print("Test text:")
    print(test_text)
    
    # Extract codes using the validator
    extracted_codes = validator.extract_and_validate_codes(test_text, 'roblox_general')
    
    print("Extracted valid codes:")
    for code in extracted_codes:
        print(f"  ✅ {code}")
    
    print(f"\nFound {len(extracted_codes)} valid codes")
    print()

def main():
    """Run all tests."""
    print("🧠 ReversCodes Automation Validation Test Suite")
    print("Testing fixes for loose scraper logic, weak validation, and unverified data")
    print("=" * 80)
    print()
    
    try:
        test_code_validation()
        test_duplicate_removal()
        test_quality_filtering()
        test_comprehensive_validation()
        test_regex_patterns()
        
        print("✅ All tests completed successfully!")
        print("\n🎯 Key Improvements Implemented:")
        print("  • Strict code format validation with regex patterns")
        print("  • Comprehensive deny-list to filter out UI strings")
        print("  • Duplicate detection and removal")
        print("  • Quality scoring based on code format, reward format, and source")
        print("  • Better selectors for different gaming sites")
        print("  • Retry logic for failed requests")
        print("  • Detailed validation logging and error reporting")
        print("  • Fallback to manual codes when scraping fails")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
