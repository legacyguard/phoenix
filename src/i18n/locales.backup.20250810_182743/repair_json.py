#!/usr/bin/env python3
import re
from pathlib import Path

# Define the locales we need to check
LOCALES_TO_CHECK = [
    'is', 'lt', 'lv', 'me', 'mk', 'mt', 'no', 'sl', 'sq', 'sr', 'tr', 'uk'
]

# Define translations for each locale
TRANSLATIONS = {
    'is': {
        'personalMessages': {
            'title': 'Skrifaðu persónuleg skilaboð',
            'description': 'Skildu eftir hlý skilaboð og mikilvæg orð fyrir ástvini þína.'
        },
        'familyMeeting': {
            'title': 'Haltu fjölskyldufund',
            'description': 'Ræddu óskir þínar og áætlanir við fjölskylduna til að tryggja að allir skilji ásetning þinn.'
        }
    },
    'lt': {
        'personalMessages': {
            'title': 'Rašykite asmeninius pranešimus',
            'description': 'Palikite šiltus pranešimus ir svarbius žodžius savo artimiesiems.'
        },
        'familyMeeting': {
            'title': 'Surenkite šeimos susitikimą',
            'description': 'Aptarkite savo norus ir planus su šeima, kad visi suprastų jūsų ketinimus.'
        }
    },
    'lv': {
        'personalMessages': {
            'title': 'Rakstiet personīgās vēstules',
            'description': 'Atstājiet sirsnīgas vēstules un svarīgus vārdus saviem mīļajiem.'
        },
        'familyMeeting': {
            'title': 'Sarīkojiet ģimenes sanāksmi',
            'description': 'Pārrunājiet savas vēlmes un plānus ar ģimeni, lai visi saprastu jūsu nodomus.'
        }
    },
    'me': {
        'personalMessages': {
            'title': 'Napišite lične poruke',
            'description': 'Ostavite tople poruke i važne riječi za svoje voljene.'
        },
        'familyMeeting': {
            'title': 'Održite porodični sastanak',
            'description': 'Razgovarajte o svojim željama i planovima sa porodicom kako bi svi razumjeli vaše namjere.'
        }
    },
    'mk': {
        'personalMessages': {
            'title': 'Напишете лични пораки',
            'description': 'Оставете топли пораки и важни зборови за вашите сакани.'
        },
        'familyMeeting': {
            'title': 'Одржете семеен состанок',
            'description': 'Разговарајте за вашите желби и планови со семејството за да сите ги разберат вашите намери.'
        }
    },
    'mt': {
        'personalMessages': {
            'title': 'Ikteb messaġġi personali',
            'description': 'Ħalli messaġġi sħan u kliem importanti għal dawk li tħobb.'
        },
        'familyMeeting': {
            'title': 'Żomm laqgħa tal-familja',
            'description': 'Iddiskuti x-xewqat u l-pjanijiet tiegħek mal-familja biex kulħadd jifhem l-intenzjonijiet tiegħek.'
        }
    },
    'no': {
        'personalMessages': {
            'title': 'Skriv personlige meldinger',
            'description': 'Legg igjen varme meldinger og viktige ord til dine kjære.'
        },
        'familyMeeting': {
            'title': 'Hold et familiemøte',
            'description': 'Diskuter dine ønsker og planer med familien for å sikre at alle forstår dine hensikter.'
        }
    },
    'sl': {
        'personalMessages': {
            'title': 'Napišite osebna sporočila',
            'description': 'Pustite topla sporočila in pomembne besede za svoje ljubljene.'
        },
        'familyMeeting': {
            'title': 'Organizirajte družinski sestanek',
            'description': 'Pogovorite se o svojih željah in načrtih z družino, da bodo vsi razumeli vaše namere.'
        }
    },
    'sq': {
        'personalMessages': {
            'title': 'Shkruani mesazhe personale',
            'description': 'Lini mesazhe të ngrohta dhe fjalë të rëndësishme për të dashurit tuaj.'
        },
        'familyMeeting': {
            'title': 'Mbani një takim familjar',
            'description': 'Diskutoni dëshirat dhe planet tuaja me familjen për të siguruar që të gjithë të kuptojnë qëllimet tuaja.'
        }
    },
    'sr': {
        'personalMessages': {
            'title': 'Напишите личне поруке',
            'description': 'Оставите топле поруке и важне речи за своје вољене.'
        },
        'familyMeeting': {
            'title': 'Одржите породични састанак',
            'description': 'Разговарајте о својим жељама и плановима са породицом како би сви разумели ваше намере.'
        }
    },
    'tr': {
        'personalMessages': {
            'title': 'Kişisel mesajlar yazın',
            'description': 'Sevdiklerinize sıcak mesajlar ve önemli sözler bırakın.'
        },
        'familyMeeting': {
            'title': 'Aile toplantısı düzenleyin',
            'description': 'Herkesin niyetinizi anlaması için isteklerinizi ve planlarınızı ailenizle tartışın.'
        }
    },
    'uk': {
        'personalMessages': {
            'title': 'Напишіть особисті повідомлення',
            'description': 'Залиште теплі повідомлення та важливі слова для ваших близьких.'
        },
        'familyMeeting': {
            'title': 'Проведіть сімейну зустріч',
            'description': 'Обговоріть свої бажання та плани з родиною, щоб усі зрозуміли ваші наміри.'
        }
    }
}

def repair_json_file(locale_code):
    """Repair a corrupted JSON file by fixing the tasks section"""
    file_path = Path(f"{locale_code}/common.json")
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the emergencyContacts section and fix the JSON structure
        # Look for the pattern where emergencyContacts ends and fix the double comma issue
        pattern = r'("emergencyContacts":\s*{[^}]+})\s*,\s*,\s*("familyMeeting":\s*{[^}]+})\s*("progress":'
        
        if re.search(pattern, content):
            # Fix the double comma and missing closing brace for tasks
            content = re.sub(pattern, r'\1,\n      "personalMessages": {\n        "title": "' + 
                           TRANSLATIONS[locale_code]['personalMessages']['title'] + 
                           '",\n        "description": "' + 
                           TRANSLATIONS[locale_code]['personalMessages']['description'] + 
                           '"\n      },\n      \2\n    },\n    \3', content)
        else:
            # Try another pattern - look for emergencyContacts followed by familyMeeting outside tasks
            # First, let's fix the double comma issue
            content = re.sub(r'},\s*,', '},', content)
            
            # Now look for the tasks section ending and familyMeeting misplaced
            pattern2 = r'("emergencyContacts":\s*{[^}]+})\s*}\s*,?\s*("familyMeeting":\s*{[^}]+})'
            match = re.search(pattern2, content)
            
            if match:
                # Find where to properly close the tasks section
                # We need to insert personalMessages and familyMeeting before the tasks closing brace
                # and move any misplaced content
                
                # First, remove the misplaced familyMeeting
                content = re.sub(r',?\s*"familyMeeting":\s*{[^}]+}\s*(?=\s*"progress")', '', content)
                
                # Now properly insert both tasks after emergencyContacts
                pattern3 = r'("emergencyContacts":\s*{[^}]+})'
                replacement = r'\1,\n      "personalMessages": {\n        "title": "' + \
                            TRANSLATIONS[locale_code]['personalMessages']['title'] + \
                            '",\n        "description": "' + \
                            TRANSLATIONS[locale_code]['personalMessages']['description'] + \
                            '"\n      },\n      "familyMeeting": {\n        "title": "' + \
                            TRANSLATIONS[locale_code]['familyMeeting']['title'] + \
                            '",\n        "description": "' + \
                            TRANSLATIONS[locale_code]['familyMeeting']['description'] + \
                            '"\n      }'
                
                content = re.sub(pattern3, replacement, content)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {locale_code}: Repaired JSON structure")
        return True
        
    except Exception as e:
        print(f"❌ {locale_code}: Error during repair: {e}")
        return False

def main():
    """Process all locales that need repair"""
    print("🔧 Repairing corrupted JSON files\n")
    
    success_count = 0
    failure_count = 0
    
    for locale in LOCALES_TO_CHECK:
        if repair_json_file(locale):
            success_count += 1
        else:
            failure_count += 1
        print()  # Add spacing between locales
    
    print(f"\n📊 Summary:")
    print(f"✅ Successfully repaired: {success_count}")
    print(f"❌ Failed: {failure_count}")
    print(f"📁 Total processed: {len(LOCALES_TO_CHECK)}")

if __name__ == "__main__":
    main()
