#!/bin/bash

# Script to add missing dashboard tasks (personalMessages and familyMeeting) to all locales

LOCALES_DIR="/Users/luborfedak/Documents/Github/legacyguard-heritage-vault/src/i18n/locales"
cd "$LOCALES_DIR"

# Function to add missing tasks to a locale
add_missing_tasks() {
    local locale=$1
    local file="$locale/common.json"
    
    echo "Processing $locale..."
    
    # Check if personalMessages already exists
    if grep -q "personalMessages" "$file"; then
        # Check if it's under dashboard.tasks
        if grep -A 2 "dashboard.tasks" "$file" | grep -q "personalMessages"; then
            echo "  ✓ personalMessages already exists in dashboard.tasks"
        else
            echo "  ⚠ personalMessages exists but not in dashboard.tasks"
        fi
    else
        echo "  ✗ personalMessages missing"
    fi
    
    # Check if familyMeeting already exists
    if grep -q "familyMeeting" "$file"; then
        # Check if it's under dashboard.tasks
        if grep -A 2 "dashboard.tasks" "$file" | grep -q "familyMeeting"; then
            echo "  ✓ familyMeeting already exists in dashboard.tasks"
        else
            echo "  ⚠ familyMeeting exists but not in dashboard.tasks"
        fi
    else
        echo "  ✗ familyMeeting missing"
    fi
}

# List of remaining locales to update
remaining_locales=(
    "hu"  # Hungarian
    "is"  # Icelandic
    "lt"  # Lithuanian
    "lv"  # Latvian
    "me"  # Montenegrin
    "mk"  # Macedonian
    "mt"  # Maltese
    "no"  # Norwegian
    "sl"  # Slovenian
    "sq"  # Albanian
    "sr"  # Serbian
    "sv"  # Swedish
    "tr"  # Turkish
    "uk"  # Ukrainian
)

# Process each locale
for locale in "${remaining_locales[@]}"; do
    if [ -d "$locale" ] && [ -f "$locale/common.json" ]; then
        add_missing_tasks "$locale"
    else
        echo "Warning: $locale/common.json not found"
    fi
done

echo -e "\nDone checking all locales!"
