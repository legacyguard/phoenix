#!/usr/bin/env python3
import json
import os
from typing import Dict, Any

def count_translatable_values(obj: Dict[str, Any], path: str = '') -> tuple[int, int, list]:
    """Count total values and those marked with [TRANSLATE]."""
    total = 0
    needs_translation = 0
    untranslated_keys = []
    
    for key, value in obj.items():
        current_path = f"{path}.{key}" if path else key
        if isinstance(value, dict):
            sub_total, sub_needs, sub_keys = count_translatable_values(value, current_path)
            total += sub_total
            needs_translation += sub_needs
            untranslated_keys.extend(sub_keys)
        elif isinstance(value, str):
            total += 1
            if value.startswith("[TRANSLATE]"):
                needs_translation += 1
                untranslated_keys.append(current_path)
    
    return total, needs_translation, untranslated_keys

def main():
    base_path = "./src/i18n/locales"
    
    # Get all language directories
    languages = [d for d in os.listdir(base_path) 
                 if os.path.isdir(os.path.join(base_path, d))]
    languages.sort()
    
    # Analyze each language
    results = []
    for lang in languages:
        lang_path = os.path.join(base_path, f"{lang}/common.json")
        if os.path.exists(lang_path):
            with open(lang_path, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
            
            total, needs_translation, untranslated_keys = count_translatable_values(lang_data)
            translated = total - needs_translation
            percentage = (translated / total * 100) if total > 0 else 0
            
            results.append({
                'lang': lang,
                'total': total,
                'translated': translated,
                'needs_translation': needs_translation,
                'percentage': percentage,
                'untranslated_keys': untranslated_keys[:5]  # First 5 for preview
            })
    
    # Sort by percentage completed
    results.sort(key=lambda x: x['percentage'], reverse=True)
    
    # Display results
    print("Translation Status Report")
    print("=" * 80)
    print(f"{'Language':<10} {'Total Keys':<12} {'Translated':<12} {'Needs Trans.':<15} {'Completion':<10}")
    print("-" * 80)
    
    for r in results:
        status = "✅" if r['percentage'] == 100 else "🔄" if r['percentage'] > 50 else "❌"
        print(f"{r['lang'].upper():<10} {r['total']:<12} {r['translated']:<12} "
              f"{r['needs_translation']:<15} {status} {r['percentage']:>6.1f}%")
    
    print("\n" + "=" * 80)
    
    # Summary statistics
    total_keys = sum(r['total'] for r in results)
    total_translated = sum(r['translated'] for r in results)
    overall_percentage = (total_translated / total_keys * 100) if total_keys > 0 else 0
    
    print(f"\nOverall Translation Progress: {overall_percentage:.1f}%")
    print(f"Total keys across all languages: {total_keys:,}")
    print(f"Total translated: {total_translated:,}")
    print(f"Total needing translation: {total_keys - total_translated:,}")
    
    # Show languages needing work
    incomplete = [r for r in results if r['percentage'] < 100]
    if incomplete:
        print("\n\nLanguages needing translation work:")
        for r in incomplete:
            print(f"\n{r['lang'].upper()} - {r['needs_translation']} keys need translation ({100 - r['percentage']:.1f}% remaining)")
            if r['untranslated_keys']:
                print("  Sample untranslated keys:")
                for key in r['untranslated_keys']:
                    print(f"    - {key}")
                if r['needs_translation'] > 5:
                    print(f"    ... and {r['needs_translation'] - 5} more")
    else:
        print("\n✅ All languages are fully translated!")

if __name__ == "__main__":
    main()
