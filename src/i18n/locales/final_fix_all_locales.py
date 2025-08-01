#!/usr/bin/env python3
import json
import os
from pathlib import Path

# Define all locales that should have these tasks
ALL_LOCALES = [
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

def check_locale_status(locale_code):
    """Check the current status of a locale file"""
    file_path = Path(f"{locale_code}/common.json")
    
    if not file_path.exists():
        return f"❌ {locale_code}: File not found"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'dashboard' not in data:
            return f"❌ {locale_code}: No 'dashboard' section"
        
        if 'tasks' not in data['dashboard']:
            return f"❌ {locale_code}: No 'tasks' in dashboard"
        
        tasks = data['dashboard']['tasks']
        has_pm = 'personalMessages' in tasks
        has_fm = 'familyMeeting' in tasks
        
        if has_pm and has_fm:
            # Check if they have content
            pm_ok = bool(tasks['personalMessages'].get('title') and tasks['personalMessages'].get('description'))
            fm_ok = bool(tasks['familyMeeting'].get('title') and tasks['familyMeeting'].get('description'))
            
            if pm_ok and fm_ok:
                return f"✅ {locale_code}: Both tasks exist with content"
            else:
                return f"⚠️  {locale_code}: Tasks exist but missing content"
        else:
            missing = []
            if not has_pm:
                missing.append('personalMessages')
            if not has_fm:
                missing.append('familyMeeting')
            return f"❌ {locale_code}: Missing {', '.join(missing)}"
            
    except json.JSONDecodeError as e:
        return f"❌ {locale_code}: Invalid JSON - {str(e)}"
    except Exception as e:
        return f"❌ {locale_code}: Error - {str(e)}"

def fix_locale_file(locale_code):
    """Fix a locale file to ensure proper structure"""
    file_path = Path(f"{locale_code}/common.json")
    
    if not file_path.exists():
        print(f"❌ {locale_code}: File not found")
        return False
    
    try:
        # Read and parse JSON
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure dashboard exists
        if 'dashboard' not in data:
            print(f"❌ {locale_code}: No dashboard section found")
            return False
        
        # Ensure tasks exists
        if 'tasks' not in data['dashboard']:
            print(f"❌ {locale_code}: No tasks section in dashboard")
            return False
        
        tasks = data['dashboard']['tasks']
        translations = TRANSLATIONS.get(locale_code, {})
        
        if not translations:
            print(f"❌ {locale_code}: No translations defined")
            return False
        
        # Check what's missing
        needs_update = False
        
        # Add personalMessages if missing or empty
        if 'personalMessages' not in tasks or not tasks.get('personalMessages', {}).get('title'):
            tasks['personalMessages'] = translations['personalMessages']
            needs_update = True
        
        # Add familyMeeting if missing or empty
        if 'familyMeeting' not in tasks or not tasks.get('familyMeeting', {}).get('title'):
            tasks['familyMeeting'] = translations['familyMeeting']
            needs_update = True
        
        if needs_update:
            # Ensure correct order (personalMessages after emergencyContacts, then familyMeeting)
            if 'emergencyContacts' in tasks:
                # Rebuild tasks in correct order
                new_tasks = {}
                for key, value in tasks.items():
                    if key not in ['personalMessages', 'familyMeeting']:
                        new_tasks[key] = value
                    if key == 'emergencyContacts':
                        new_tasks['personalMessages'] = tasks.get('personalMessages', translations['personalMessages'])
                        new_tasks['familyMeeting'] = tasks.get('familyMeeting', translations['familyMeeting'])
                
                # Add any remaining keys that weren't processed
                for key, value in tasks.items():
                    if key not in new_tasks:
                        new_tasks[key] = value
                
                data['dashboard']['tasks'] = new_tasks
            
            # Write back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ {locale_code}: Fixed and updated")
            return True
        else:
            print(f"✅ {locale_code}: Already correct")
            return True
            
    except json.JSONDecodeError as e:
        print(f"❌ {locale_code}: Invalid JSON - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ {locale_code}: Error - {str(e)}")
        return False

def main():
    """Check and fix all locales"""
    print("🔍 Checking status of all locale files...\n")
    
    # First, check the current status
    for locale in ALL_LOCALES:
        status = check_locale_status(locale)
        print(status)
    
    print("\n" + "="*60 + "\n")
    print("🔧 Fixing locale files that need updates...\n")
    
    # Now fix any that need it
    success_count = 0
    failure_count = 0
    
    for locale in ALL_LOCALES:
        status = check_locale_status(locale)
        if "❌" in status or "⚠️" in status:
            if fix_locale_file(locale):
                success_count += 1
            else:
                failure_count += 1
        else:
            print(f"✅ {locale}: Already correct, skipping")
            success_count += 1
    
    print(f"\n📊 Final Summary:")
    print(f"✅ Successfully processed: {success_count}")
    print(f"❌ Failed: {failure_count}")
    print(f"📁 Total locales: {len(ALL_LOCALES)}")
    
    # Final verification
    print("\n🔍 Final verification:\n")
    for locale in ALL_LOCALES:
        status = check_locale_status(locale)
        print(status)

if __name__ == "__main__":
    main()
