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

def get_value_by_path(obj: Dict[str, Any], path: str) -> Any:
    """Get value from nested dictionary using dot notation path."""
    keys = path.split('.')
    current = obj
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    return current

def set_value_by_path(obj: Dict[str, Any], path: str, value: Any) -> None:
    """Set value in nested dictionary using dot notation path."""
    keys = path.split('.')
    current = obj
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    current[keys[-1]] = value

def copy_missing_keys(source: Dict[str, Any], target: Dict[str, Any], missing_keys: Set[str]) -> int:
    """Copy missing keys from source to target."""
    copied_count = 0
    for key in missing_keys:
        value = get_value_by_path(source, key)
        if value is not None:
            # For non-English languages, add a marker to indicate it needs translation
            if isinstance(value, str):
                value = f"[TRANSLATE] {value}"
            set_value_by_path(target, key, value)
            copied_count += 1
    return copied_count

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
    
    # Check and fix each language
    results = []
    for lang in languages:
        lang_path = os.path.join(base_path, f"{lang}/common.json")
        if os.path.exists(lang_path):
            # Load language data
            with open(lang_path, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
            
            # Find missing keys
            lang_keys = get_keys(lang_data)
            missing_keys = en_keys - lang_keys
            extra_keys = lang_keys - en_keys
            
            # Copy missing keys from English
            copied_count = 0
            if missing_keys:
                copied_count = copy_missing_keys(en_data, lang_data, missing_keys)
                
                # Save updated translations
                with open(lang_path, 'w', encoding='utf-8') as f:
                    json.dump(lang_data, f, ensure_ascii=False, indent=2)
            
            results.append({
                'lang': lang,
                'total': len(lang_keys),
                'missing': len(missing_keys),
                'extra': len(extra_keys),
                'copied': copied_count
            })
            
            print(f"Language: {lang.upper()}")
            print(f"  - Total keys: {len(lang_keys)}")
            print(f"  - Missing keys: {len(missing_keys)}")
            print(f"  - Extra keys: {len(extra_keys)}")
            print(f"  - Keys copied: {copied_count}")
            
            if extra_keys:
                print(f"  - Extra keys that don't exist in English:")
                for key in sorted(extra_keys)[:5]:  # Show first 5
                    print(f"    • {key}")
                if len(extra_keys) > 5:
                    print(f"    ... and {len(extra_keys) - 5} more")
            print()
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total languages checked: {len(results)}")
    
    total_copied = sum(r['copied'] for r in results)
    print(f"Total keys copied: {total_copied}")
    
    if total_copied > 0:
        print("\nLanguages that were updated:")
        for r in results:
            if r['copied'] > 0:
                print(f"  - {r['lang']}: {r['copied']} keys added")
    
    # Check if all languages now have the same keys as English
    print("\nVerifying all languages...")
    all_complete = True
    for lang in languages:
        lang_path = os.path.join(base_path, f"{lang}/common.json")
        if os.path.exists(lang_path):
            with open(lang_path, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
            lang_keys = get_keys(lang_data)
            if len(en_keys - lang_keys) > 0:
                all_complete = False
                print(f"  ❌ {lang} still has missing keys")
            else:
                print(f"  ✅ {lang} is complete")
    
    if all_complete:
        print("\n✅ All languages are now synchronized with English!")
    else:
        print("\n⚠️  Some languages still have issues. Please check manually.")
    
    print("\nNote: Keys marked with [TRANSLATE] need to be translated from English.")

if __name__ == "__main__":
    main()
