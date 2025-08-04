#!/usr/bin/env python3
import json
import sys
from typing import Dict, Any, Set, List, Tuple

def load_json_file(file_path: str) -> Dict[str, Any]:
    """Load and parse a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return {}

def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """Flatten a nested dictionary using dot notation."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def find_missing_keys(en_data: Dict[str, Any], et_data: Dict[str, Any]) -> Set[str]:
    """Find keys that exist in English but not in Estonian."""
    en_flat = flatten_dict(en_data)
    et_flat = flatten_dict(et_data)
    return set(en_flat.keys()) - set(et_flat.keys())

def find_untranslated_values(en_data: Dict[str, Any], et_data: Dict[str, Any]) -> List[Tuple[str, str, str]]:
    """Find values in Estonian that are identical to English (likely untranslated)."""
    en_flat = flatten_dict(en_data)
    et_flat = flatten_dict(et_data)
    
    untranslated = []
    for key in et_flat:
        if key in en_flat:
            en_value = en_flat[key]
            et_value = et_flat[key]
            
            # Check if values are identical (case-insensitive)
            if isinstance(en_value, str) and isinstance(et_value, str):
                if en_value.lower() == et_value.lower():
                    untranslated.append((key, en_value, et_value))
    
    return untranslated

def main():
    # Load the locale files
    en_file = "src/i18n/locales/en/common.json"
    et_file = "src/i18n/locales/et/common.json"
    
    en_data = load_json_file(en_file)
    et_data = load_json_file(et_file)
    
    if not en_data or not et_data:
        print("Failed to load one or both locale files")
        sys.exit(1)
    
    # Find missing keys
    missing_keys = find_missing_keys(en_data, et_data)
    
    # Find untranslated values
    untranslated_values = find_untranslated_values(en_data, et_data)
    
    # Print results
    print("=== MISSING KEYS IN ESTONIAN ===")
    print(f"Total missing keys: {len(missing_keys)}")
    for key in sorted(missing_keys):
        print(f"  {key}")
    
    print("\n=== UNTRANSLATED VALUES ===")
    print(f"Total untranslated values: {len(untranslated_values)}")
    for key, en_value, et_value in untranslated_values:
        print(f"  {key}:")
        print(f"    EN: {en_value}")
        print(f"    ET: {et_value}")
        print()

if __name__ == "__main__":
    main() 