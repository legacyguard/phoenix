#!/usr/bin/env python3
import json
import os
import re

# Common English words that need translation
english_terms = [
    "Welcome", "Error", "Failed", "Success", "Click", "Update", "Add", "Delete", 
    "Please", "Save", "User", "Security", "Profile", "Account", "Message", "Email", 
    "Document", "Help", "Settings", "Loading", "Family", "Home", "Create", "Cancel", 
    "Submit", "View", "Download", "Support", "Privacy", "Terms", "Contact", "About",
    "Dashboard", "Upload", "File", "Close", "Open", "New", "Edit", "Remove"
]

# Create regex pattern for whole words
pattern = re.compile(r'\b(' + '|'.join(english_terms) + r')\b', re.IGNORECASE)

def scan_json_file(filepath):
    """Scan a JSON file for English terms"""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            data = json.loads(content)
        
        # Get line numbers for better reporting
        lines = content.split('\n')
        
        def check_value(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    new_path = f"{path}.{key}" if path else key
                    check_value(value, new_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    check_value(item, f"{path}[{i}]")
            elif isinstance(obj, str):
                # Skip special keys and technical terms
                if path.endswith(('_comment', 'console', 'emailPlaceholder', 'phonePlaceholder')):
                    return
                
                matches = pattern.findall(obj)
                if matches:
                    # Find line number
                    line_num = None
                    for i, line in enumerate(lines, 1):
                        if obj in line:
                            line_num = i
                            break
                    
                    issues.append({
                        'path': path,
                        'value': obj,
                        'english_terms': list(set(matches)),
                        'line': line_num
                    })
        
        check_value(data)
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    
    return issues

def main():
    cs_dir = "/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales/cs"
    
    print("Scanning Czech translation files for English terms...\n")
    
    all_issues = {}
    
    for filename in sorted(os.listdir(cs_dir)):
        if filename.endswith('.json'):
            filepath = os.path.join(cs_dir, filename)
            issues = scan_json_file(filepath)
            
            if issues:
                all_issues[filename] = issues
    
    # Generate report
    if all_issues:
        print("=== ENGLISH TERMS FOUND IN CZECH TRANSLATIONS ===\n")
        
        total_issues = 0
        
        for filename, issues in all_issues.items():
            print(f"\n📄 {filename} ({len(issues)} issues)")
            print("-" * 50)
            
            for issue in issues[:10]:  # Show first 10 issues per file
                print(f"Line {issue['line'] or '?'}: {issue['path']}")
                print(f"   Value: \"{issue['value']}\"")
                print(f"   English terms: {', '.join(issue['english_terms'])}")
                print()
            
            if len(issues) > 10:
                print(f"   ... and {len(issues) - 10} more issues\n")
            
            total_issues += len(issues)
        
        print("\n=== SUMMARY ===")
        print(f"Total files with issues: {len(all_issues)}")
        print(f"Total English terms found: {total_issues}")
        
        # Create a detailed JSON report
        with open('/Users/luborfedak/Documents/Github/phoenix/czech_translation_issues.json', 'w', encoding='utf-8') as f:
            json.dump(all_issues, f, ensure_ascii=False, indent=2)
        
        print("\nDetailed report saved to: czech_translation_issues.json")
    else:
        print("✅ No English terms found in Czech translations!")

if __name__ == "__main__":
    main()
