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

def fix_corrupted_json(locale_code):
    """Fix the specific corruption pattern in the JSON files"""
    file_path = Path(f"{locale_code}/common.json")
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix the specific pattern we're seeing:
        # 1. Double comma after emergencyContacts
        # 2. familyMeeting without personalMessages
        # 3. Missing comma after familyMeeting
        # 4. Missing closing brace for tasks
        
        # Pattern to match the corrupted section
        pattern = r'("emergencyContacts"\s*:\s*{[^}]+})\s*,\s*,\s*("familyMeeting"\s*:\s*{[^}]+})\s*\n\s*("progress"\s*:)'
        
        # Replacement with proper structure
        replacement = r'\1,\n      "personalMessages": {\n        "title": "' + \
                     TRANSLATIONS[locale_code]['personalMessages']['title'] + \
                     '",\n        "description": "' + \
                     TRANSLATIONS[locale_code]['personalMessages']['description'] + \
                     '"\n      },\n      \2\n    },\n    \3'
        
        # Apply the fix
        fixed_content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
        
        # Check if the replacement was made
        if fixed_content != content:
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✅ {locale_code}: Fixed JSON structure")
            return True
        else:
            print(f"❌ {locale_code}: Pattern not found or already fixed")
            return False
        
    except Exception as e:
        print(f"❌ {locale_code}: Error: {e}")
        return False

def main():
    """Process all locales that need fixing"""
    print("🔧 Fixing corrupted JSON files with targeted pattern matching\n")
    
    success_count = 0
    failure_count = 0
    
    for locale in LOCALES_TO_CHECK:
        if fix_corrupted_json(locale):
            success_count += 1
        else:
            failure_count += 1
    
    print(f"\n📊 Summary:")
    print(f"✅ Successfully fixed: {success_count}")
    print(f"❌ Failed: {failure_count}")
    print(f"📁 Total processed: {len(LOCALES_TO_CHECK)}")

if __name__ == "__main__":
    main()
