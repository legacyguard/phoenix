#!/usr/bin/env python3
import json
import os
from typing import Dict, Set, Any

def get_keys(obj: Dict[str, Any], prefix: str = '') -> Set[str]:
    """Recursively extract all keys from a nested dictionary."""
    keys = set()
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.update(get_keys(value, full_key))
        else:
            keys.add(full_key)
    return keys

def remove_key_by_path(obj: Dict[str, Any], path: str) -> bool:
    """Remove a key from nested dictionary using dot notation path."""
    keys = path.split('.')
    current = obj
    
    # Navigate to the parent of the key to remove
    for key in keys[:-1]:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return False
    
    # Remove the key if it exists
    if keys[-1] in current:
        del current[keys[-1]]
        return True
    return False

def clean_empty_dicts(obj: Dict[str, Any]) -> Dict[str, Any]:
    """Remove empty dictionaries from the structure."""
    if not isinstance(obj, dict):
        return obj
    
    result = {}
    for key, value in obj.items():
        if isinstance(value, dict):
            cleaned = clean_empty_dicts(value)
            if cleaned:  # Only add non-empty dicts
                result[key] = cleaned
        else:
            result[key] = value
    
    return result

def main():
    base_path = "./src/i18n/locales"
    
    # Load English (reference) translations
    en_path = os.path.join(base_path, "en/common.json")
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    en_keys = get_keys(en_data)
    print(f"English reference has {len(en_keys)} keys\n")
    
    # Get all language directories
    languages = [d for d in os.listdir(base_path) 
                 if os.path.isdir(os.path.join(base_path, d)) and d != 'en']
    languages.sort()
    
    # Process each language
    total_removed = 0
    for lang in languages:
        lang_path = os.path.join(base_path, f"{lang}/common.json")
        if os.path.exists(lang_path):
            # Load language data
            with open(lang_path, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
            
            # Find extra keys
            lang_keys = get_keys(lang_data)
            extra_keys = lang_keys - en_keys
            
            if extra_keys:
                print(f"Language: {lang.upper()}")
                print(f"  Removing {len(extra_keys)} extra keys:")
                
                # Remove extra keys
                removed_count = 0
                for key in sorted(extra_keys):
                    if remove_key_by_path(lang_data, key):
                        print(f"    - {key}")
                        removed_count += 1
                
                # Clean empty dictionaries
                lang_data = clean_empty_dicts(lang_data)
                
                # Save updated translations
                with open(lang_path, 'w', encoding='utf-8') as f:
                    json.dump(lang_data, f, ensure_ascii=False, indent=2)
                
                print(f"  Total removed: {removed_count}\n")
                total_removed += removed_count
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total extra keys removed: {total_removed}")
    
    # Verify all languages now match English structure
    print("\nVerifying all languages have the same structure as English...")
    all_match = True
    for lang in languages:
        lang_path = os.path.join(base_path, f"{lang}/common.json")
        if os.path.exists(lang_path):
            with open(lang_path, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
            lang_keys = get_keys(lang_data)
            
            missing = len(en_keys - lang_keys)
            extra = len(lang_keys - en_keys)
            
            if missing == 0 and extra == 0:
                print(f"  ✅ {lang} - Perfect match ({len(lang_keys)} keys)")
            else:
                all_match = False
                print(f"  ❌ {lang} - Missing: {missing}, Extra: {extra}")
    
    if all_match:
        print("\n✅ All languages now have identical structure to English!")
    else:
        print("\n⚠️  Some languages still have discrepancies.")

if __name__ == "__main__":
    main()
