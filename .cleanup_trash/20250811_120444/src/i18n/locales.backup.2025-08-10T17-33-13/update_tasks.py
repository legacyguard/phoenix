#!/usr/bin/env python3
import json
import os

# Base directory for locales
base_dir = "/Users/luborfedak/Documents/Github/legacyguard-heritage-vault/src/i18n/locales"

# Translations for personalMessages and familyMeeting tasks by locale
translations = {
    "is": {  # Icelandic
        "personalMessages": {
            "title": "Skrifaðu persónuleg skilaboð",
            "description": "Skildu eftir hlý skilaboð og mikilvæg orð fyrir ástvini þína."
        },
        "familyMeeting": {
            "title": "Haldið fjölskyldufund",
            "description": "Ræddu óskir þínar og áætlanir við fjölskylduna til að tryggja að allir skilji fyrirætlanir þínar."
        }
    },
    "lt": {  # Lithuanian
        "personalMessages": {
            "title": "Parašykite asmeninius pranešimus",
            "description": "Palikite šiltus pranešimus ir svarbius žodžius savo artimiesiems."
        },
        "familyMeeting": {
            "title": "Surenkite šeimos susitikimą",
            "description": "Aptarkite savo norus ir planus su šeima, kad visi suprastų jūsų ketinimus."
        }
    },
    "lv": {  # Latvian
        "personalMessages": {
            "title": "Uzrakstiet personīgus ziņojumus",
            "description": "Atstājiet siltus ziņojumus un svarīgus vārdus saviem mīļajiem."
        },
        "familyMeeting": {
            "title": "Noorganizējiet ģimenes tikšanos",
            "description": "Pārrunājiet savas vēlmes un plānus ar ģimeni, lai visi saprastu jūsu nodomus."
        }
    },
    "me": {  # Montenegrin
        "personalMessages": {
            "title": "Napišite lične poruke",
            "description": "Ostavite tople poruke i važne riječi svojim voljenima."
        },
        "familyMeeting": {
            "title": "Održite porodični sastanak",
            "description": "Razgovarajte o svojim željama i planovima sa porodicom kako biste osigurali da svi razumiju vaše namjere."
        }
    },
    "mk": {  # Macedonian
        "personalMessages": {
            "title": "Напишете лични пораки",
            "description": "Оставете топли пораки и важни зборови за вашите сакани."
        },
        "familyMeeting": {
            "title": "Одржете семеен состанок",
            "description": "Разговарајте за вашите желби и планови со семејството за да се осигурите дека сите ги разбираат вашите намери."
        }
    },
    "mt": {  # Maltese
        "personalMessages": {
            "title": "Ikteb messaġġi personali",
            "description": "Ħalli messaġġi sħan u kliem importanti għal dawk li tħobb."
        },
        "familyMeeting": {
            "title": "Organizza laqgħa tal-familja",
            "description": "Iddiskuti x-xewqat u l-pjanijiet tiegħek mal-familja biex tiżgura li kulħadd jifhem l-intenzjonijiet tiegħek."
        }
    },
    "no": {  # Norwegian
        "personalMessages": {
            "title": "Skriv personlige meldinger",
            "description": "Legg igjen varme meldinger og viktige ord til dine kjære."
        },
        "familyMeeting": {
            "title": "Arranger familiesamling",
            "description": "Diskuter dine ønsker og planer med familien for å sikre at alle forstår dine intensjoner."
        }
    },
    "sl": {  # Slovenian
        "personalMessages": {
            "title": "Napišite osebna sporočila",
            "description": "Pustite topla sporočila in pomembne besede svojim ljubljenim."
        },
        "familyMeeting": {
            "title": "Organizirajte družinski sestanek",
            "description": "Pogovorite se o svojih željah in načrtih z družino, da zagotovite razumevanje vaših namenov."
        }
    },
    "sq": {  # Albanian
        "personalMessages": {
            "title": "Shkruani mesazhe personale",
            "description": "Lini mesazhe të ngrohta dhe fjalë të rëndësishme për të dashurit tuaj."
        },
        "familyMeeting": {
            "title": "Mbani një takim familjar",
            "description": "Diskutoni dëshirat dhe planet tuaja me familjen për të siguruar që të gjithë të kuptojnë qëllimet tuaja."
        }
    },
    "sr": {  # Serbian
        "personalMessages": {
            "title": "Напишите личне поруке",
            "description": "Оставите топле поруке и важне речи својим вољенима."
        },
        "familyMeeting": {
            "title": "Одржите породични састанак",
            "description": "Разговарајте о својим жељама и плановима са породицом како бисте осигурали да сви разумеју ваше намере."
        }
    },
    "sv": {  # Swedish
        "personalMessages": {
            "title": "Skriv personliga meddelanden",
            "description": "Lämna varma meddelanden och viktiga ord till dina nära och kära."
        },
        "familyMeeting": {
            "title": "Håll ett familjemöte",
            "description": "Diskutera dina önskemål och planer med familjen för att säkerställa att alla förstår dina avsikter."
        }
    },
    "tr": {  # Turkish
        "personalMessages": {
            "title": "Kişisel mesajlar yazın",
            "description": "Sevdiklerinize sıcak mesajlar ve önemli sözler bırakın."
        },
        "familyMeeting": {
            "title": "Aile toplantısı düzenleyin",
            "description": "Herkesin niyetlerinizi anlamasını sağlamak için isteklerinizi ve planlarınızı ailenizle görüşün."
        }
    },
    "uk": {  # Ukrainian
        "personalMessages": {
            "title": "Напишіть особисті повідомлення",
            "description": "Залиште теплі повідомлення та важливі слова для ваших близьких."
        },
        "familyMeeting": {
            "title": "Проведіть сімейну зустріч",
            "description": "Обговоріть свої побажання та плани з родиною, щоб переконатися, що всі розуміють ваші наміри."
        }
    }
}

def update_locale(locale_code):
    """Update a specific locale with missing tasks"""
    file_path = os.path.join(base_dir, locale_code, "common.json")
    
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} does not exist")
        return False
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if emergencyContacts exists to find insertion point
        if '"emergencyContacts"' not in content:
            print(f"Error: {locale_code} - emergencyContacts not found")
            return False
        
        # Check if personalMessages and familyMeeting already exist
        has_personal = '"personalMessages"' in content
        has_family = '"familyMeeting"' in content
        
        if has_personal and has_family:
            print(f"✓ {locale_code} - Both tasks already exist")
            return True
        
        # Get translations for this locale
        if locale_code not in translations:
            print(f"Error: {locale_code} - No translations available")
            return False
        
        trans = translations[locale_code]
        
        # Find the location after emergencyContacts to insert new tasks
        # Look for the closing brace of emergencyContacts
        import re
        pattern = r'("emergencyContacts":\s*{[^}]+})(,?)'
        match = re.search(pattern, content)
        
        if not match:
            print(f"Error: {locale_code} - Could not find emergencyContacts pattern")
            return False
        
        # Build the new tasks JSON
        new_tasks = []
        if not has_personal:
            new_tasks.append(f'''      "personalMessages": {{
        "title": "{trans['personalMessages']['title']}",
        "description": "{trans['personalMessages']['description']}"
      }}''')
            print(f"+ {locale_code} - Added personalMessages")
        
        if not has_family:
            new_tasks.append(f'''      "familyMeeting": {{
        "title": "{trans['familyMeeting']['title']}",
        "description": "{trans['familyMeeting']['description']}"
      }}''')
            print(f"+ {locale_code} - Added familyMeeting")
        
        if new_tasks:
            # Insert the new tasks after emergencyContacts
            insertion = match.group(0) + ',\n' + ',\n'.join(new_tasks)
            new_content = content.replace(match.group(0), insertion)
            
            # Write back the file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        
        return True
        
    except Exception as e:
        print(f"Error updating {locale_code}: {str(e)}")
        return False

# Process all locales
locales_to_update = ["is", "lt", "lv", "me", "mk", "mt", "no", "sl", "sq", "sr", "sv", "tr", "uk"]

print("Starting update process...")
print("-" * 50)

success_count = 0
for locale in locales_to_update:
    if update_locale(locale):
        success_count += 1

print("-" * 50)
print(f"Update complete: {success_count}/{len(locales_to_update)} locales updated successfully")
