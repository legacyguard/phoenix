#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

# Define the locales we need to check (excluding those we know are already fixed)
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

def fix_locale_file(locale_code):
    """Fix a single locale file to ensure proper dashboard.tasks structure"""
    file_path = Path(f"{locale_code}/common.json")
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            data = json.loads(content)
        
        # Check if dashboard.tasks exists
        if 'dashboard' not in data:
            print(f"❌ {locale_code}: No 'dashboard' section found")
            return False
        
        if 'tasks' not in data['dashboard']:
            print(f"❌ {locale_code}: No 'tasks' section in dashboard")
            return False
        
        tasks = data['dashboard']['tasks']
        translations = TRANSLATIONS.get(locale_code, {})
        
        # Check current state
        has_personal = 'personalMessages' in tasks
        has_family = 'familyMeeting' in tasks
        
        if has_personal and has_family:
            print(f"✅ {locale_code}: Both tasks already exist correctly")
            return True
        
        # Find emergencyContacts to insert after
        if 'emergencyContacts' not in tasks:
            print(f"❌ {locale_code}: No 'emergencyContacts' task found to insert after")
            return False
        
        # We need to rebuild the tasks dict to maintain order
        new_tasks = {}
        for key, value in tasks.items():
            new_tasks[key] = value
            if key == 'emergencyContacts':
                # Insert personalMessages if missing
                if not has_personal and 'personalMessages' in translations:
                    new_tasks['personalMessages'] = translations['personalMessages']
                # Insert familyMeeting if missing
                if not has_family and 'familyMeeting' in translations:
                    new_tasks['familyMeeting'] = translations['familyMeeting']
        
        # Update the data
        data['dashboard']['tasks'] = new_tasks
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {locale_code}: Fixed! Added missing tasks")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ {locale_code}: JSON parsing error: {e}")
        return False
    except Exception as e:
        print(f"❌ {locale_code}: Error: {e}")
        return False

def main():
    """Process all locales that need fixing"""
    print("🔧 Fixing locale files with proper dashboard.tasks structure\n")
    
    success_count = 0
    failure_count = 0
    
    for locale in LOCALES_TO_CHECK:
        if fix_locale_file(locale):
            success_count += 1
        else:
            failure_count += 1
        print()  # Add spacing between locales
    
    print(f"\n📊 Summary:")
    print(f"✅ Successfully fixed: {success_count}")
    print(f"❌ Failed: {failure_count}")
    print(f"📁 Total processed: {len(LOCALES_TO_CHECK)}")

if __name__ == "__main__":
    main()
