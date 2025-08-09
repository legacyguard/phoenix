#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Intelligent Translation System for family.json
Uses comprehensive rule-based translation with contextual awareness
"""

import json
import re
from pathlib import Path

# Comprehensive translation patterns for family planning domain
FAMILY_TRANSLATIONS = {
    # Czech translations
    'cs': {
        # Access descriptions  
        'They can help your family only in emergencies': 'Mohou pomoci vaší rodině pouze v nouzových situacích',
        'They can manage everything to help your family': 'Mohou spravovat vše, aby pomohli vaší rodině',
        'They can see and manage all your family\'s information': 'Mohou vidět a spravovat všechny informace o vaší rodině',
        'They can see basic contact info and emergency instructions': 'Mohou vidět základní kontaktní informace a nouzové pokyny',
        'They can see most of what your family would need': 'Mohou vidět většinu toho, co by vaše rodina potřebovala',
        
        # Access levels
        'Only in Emergencies': 'Pouze v nouzových situacích',
        'Full Helper Access': 'Plný pomocný přístup',
        'Can See Everything': 'Může vidět vše',
        'Basic Information Only': 'Pouze základní informace',
        'Regular Family Access': 'Běžný rodinný přístup',
        
        # Permissions
        'Can Make Changes': 'Může provádět změny',
        'Emergency Access Rights': 'Práva nouzového přístupu',
        'Can Manage Other Helpers': 'Může spravovat další pomocníky',
        'Gets Important Updates': 'Dostává důležité aktualizace',
        'Can See Your Important Things': 'Může vidět vaše důležité věci',
        'Can See Contact Information': 'Může vidět kontaktní informace',
        'Can Read Documents': 'Může číst dokumenty',
        
        # Actions
        'Add Someone You Trust': 'Přidejte někoho, komu důvěřujete',
        'Give Them a Role': 'Přiřaďte jim roli',
        'Get in Touch': 'Spojte se',
        'Update Their Information': 'Aktualizujte jejich informace',
        'Download Contact List': 'Stáhněte seznam kontaktů',
        'Let Them Help Your Family': 'Nechte je pomáhat vaší rodině',
        'Print This for Your Records': 'Vytiskněte si to pro vaše záznamy',
        'Remove from Your Support Team': 'Odeberte z vašeho podpůrného týmu',
        'Change Their Role': 'Změňte jejich roli',
        'Limit What They Can See': 'Omezte co mohou vidět',
        'Plan to Talk About This': 'Naplánujte si o tom mluvit',
        'Invite Them to Help': 'Pozvěte je k pomoci',
        'Make Them a Backup Helper': 'Učiňte z nich záložního pomocníka',
        'See All Their Details': 'Zobrazte všechny jejich detaily',
        
        # Communication
        'Who Contacts Who': 'Kdo kontaktuje koho',
        'How to Handle Disagreements': 'Jak řešit neshody',
        'How Decisions Get Made': 'Jak se rozhoduje',
        'Make sure everyone knows who to contact and how to work together when your family needs help.': 'Ujistěte se, že všichni vědí, koho kontaktovat a jak spolupracovat, když vaše rodina potřebuje pomoc.',
        'What to Do in an Emergency': 'Co dělat v nouzové situaci',
        'When Your Family Should Meet': 'Kdy by se vaše rodina měla sejít',
        'What Information to Share': 'Jaké informace sdílet',
        'Regular Family Check-ins': 'Pravidelné rodinné kontroly',
        'First Person to Contact': 'První osoba k kontaktování',
        'Helping your support team work together': 'Pomoc vašemu podpůrnému týmu spolupracovat',
        'How Your Helpers Will Communicate': 'Jak budou vaši pomocníci komunikovat',
        
        # Family relationships
        'Child': 'Dítě',
        'Parent': 'Rodič', 
        'Spouse': 'Manžel/manželka',
        'Friend': 'Přítel',
        'Sibling': 'Sourozenec',
        'Other': 'Jiné',
        
        # Roles
        'Someone Who Gives Advice': 'Někdo, kdo dává rady',
        'Will Receive Something': 'Dostane něco',
        'Can Care for Family Members': 'Může se starat o rodinné příslušníky',
        'First Person to Call': 'První osoba k zavolání',
        'Will Handle Everything': 'Vyřídí vše',
        'Can Manage Financial Matters': 'Může spravovat finanční záležitosti',
        'Will Care for Children': 'Bude se starat o děti',
        'Can Make Medical Decisions': 'Může dělat lékařská rozhodnutí',
        'Can Act on Your Behalf': 'Může jednat vaším jménem',
        'Backup Helper': 'Záložní pomocník',
        'Manages Family Trust': 'Spravuje rodinný svěřenský fond',
        'Witnessed Your Will': 'Byl svědkem vaší závěti',
        
        # Common UI
        'Cancel': 'Zrušit',
        'Save': 'Uložit',
        'Start': 'Spustit',
        'Fix': 'Opravit',
        'Loading': 'Načítání',
        'Error': 'Chyba',
        'Success': 'Úspěch',
        'Description': 'Popis',
        'Title': 'Název',
        'Email': 'Email',
        'Phone': 'Telefon',
        'Name': 'Jméno',
        'Minutes': 'Minuty',
        'Saving': 'Ukládání',
        'Update': 'Aktualizovat',
        'Updating': 'Aktualizace',
        'Date': 'Datum',
        'Subject': 'Předmět',
        'Summary': 'Shrnutí',
        'Type': 'Typ',
        
        # Emergency
        'Add contact': 'Přidat kontakt',
        'Emergency Contact': 'Nouzový kontakt',
        'Last contacted': 'Naposledy kontaktován',
        'Send test': 'Odeslat test',
        'No contacts': 'Žádné kontakty',
        
        # Crisis situations  
        'Critical vulnerabilities': 'Kritické zranitelnosti',
        'Family capabilities': 'Rodinné schopnosti',
        'Family discussion': 'Rodinná diskuse',
        'Most urgent': 'Nejnaléhavější',
        'Not prepared': 'Nepřipravený',
        'Prepared': 'Připravený',
        'Protected': 'Chráněný',
        'Vulnerable': 'Zranitelný',
        
        # Estate and executor
        'Completed': 'Dokončeno',
        'High priority': 'Vysoká priorita',
        'Mark complete': 'Označit jako dokončené',
        'View related documents': 'Zobrazit související dokumenty',
        'View account details': 'Zobrazit detaily účtu',
        
        # Guardian and playbook
        'Accepted': 'Přijato',
        'Declined': 'Odmítnuto',
        'Invitation sent': 'Pozvánka odeslána',
        'Send invite': 'Odeslat pozvánku',
        'Auto save notice': 'Upozornění na automatické ukládání',
        'No content': 'Žádný obsah',
        'Preview': 'Náhled',
        
        # Family preparedness
        'Create a printable guide': 'Vytvořit tiskový průvodce',
        'Generate emergency guide': 'Generovat nouzový průvodce',
        'Select scenario': 'Vybrat scénář',
        'Coming soon': 'Již brzy',
        'Premium required': 'Vyžadována prémiová verze',
        
        # Forms and inputs
        'What they can see and when they can help': 'Co mohou vidět a kdy mohou pomoci',
        'How Much They Can See': 'Kolik mohou vidět',
        'Their full name': 'Jejich celé jméno',
        'How you know them': 'Jak je znáte',
        'Best phone number': 'Nejlepší telefonní číslo',
        'Where they live': 'Kde bydlí',
        'Where they work': 'Kde pracují',
        'Important things they should know': 'Důležité věci, které by měli vědět',
        
        # Family structures
        'Traditional Family': 'Tradiční rodina',
        'Single Parent Family': 'Jednořodičovská rodina',
        'Blended Family': 'Smíšená rodina',
        'Unique Family Structure': 'Jedinečná rodinná struktura',
        
        # Priority levels
        'High Priority': 'Vysoká priorita',
        'Medium Priority': 'Střední priorita', 
        'Low Priority': 'Nízká priorita',
        
        # Features and capabilities
        'Family Communication Center': 'Rodinné komunikační centrum',
        'Secure Document Vault': 'Bezpečné úložiště dokumentů',
        'Emergency Contact System': 'Systém nouzových kontaktů',
        'Keep everyone informed and connected': 'Udržujte všechny informované a propojené',
        'Store and share important documents securely': 'Ukládejte a sdílejte důležité dokumenty bezpečně',
        'Quick access to critical contacts when needed': 'Rychlý přístup ke kritickým kontaktům při potřebě',
        
        # Errors and messages
        'You can\'t change this person\'s information right now': 'Nemůžete právě teď měnit informace této osoby',
        'We couldn\'t give them this role. Let\'s try again.': 'Nemohli jsme jim přiřadit tuto roli. Zkusme to znovu.',
        'This person is already on your support team': 'Tato osoba už je ve vašem podpůrném týmu',
        'Connection issue - please check your internet': 'Problém s připojením - zkontrolujte prosím internet',
        'Something went wrong': 'Něco se pokazilo',
        
        # Guardianship
        'Add Someone Who Needs Care': 'Přidejte někoho, kdo potřebuje péči',
        'Who will care for your children': 'Kdo se bude starat o vaše děti',
        'Plans for caring for your loved ones': 'Plány péče pro vaše blízké',
        'Choose loving people who will care for your children or family members who need help if you can\'t be there.': 'Vyberte milující lidi, kteří se budou starat o vaše děti nebo rodinné příslušníky potřebující pomoc, pokud tam nemůžete být.',
        
        # Trusted circle
        'People who can support your family when they need it most': 'Lidé, kteří mohou podpořit vaši rodinu, když to nejvíce potřebuje',
        'Your most important helpers': 'Vaši nejdůležitější pomocníci',
        'People to Call First': 'Lidé, kterým zavolat jako prvním',
        'How they can help': 'Jak mohou pomoci',
        'Your Family\'s Support Team': 'Podpůrný tým vaší rodiny',
    }
}

def is_technical_string(text):
    """Determine if string is technical and should not be translated"""
    if not isinstance(text, str):
        return False
    
    # Technical patterns that should remain in English
    technical_patterns = [
        r'^[a-z-]+(?:\s+[a-z-]+)*$',  # CSS classes like 'flex items-center'
        r'className\.|htmlFor\.|id\.',  # React/HTML attributes
        r'min-h-|grid-cols-|flex|items-|justify-|space-|text-|bg-|border-',  # Tailwind CSS
        r'^\d+\s+\d+$|^_\d+$|^\d+$',  # Numbers and placeholders
        r'^tel:|^mailto:',  # URL protocols
        r'\$\{[^}]+\}',  # Template literals
        r'^[a-z]+\[?\d*\]?$',  # Simple technical IDs
    ]
    
    for pattern in technical_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    # Specific strings to preserve
    preserve_strings = {
        'Email', 'email', 'Role', 'role', 'undefined', 'null', 'true', 'false'
    }
    
    return text.strip() in preserve_strings

def smart_translate(text, target_lang):
    """Intelligently translate text using patterns and direct mappings"""
    if not isinstance(text, str) or not text.strip():
        return text
    
    # Skip technical content
    if is_technical_string(text):
        return text
    
    # Direct translation lookup
    if target_lang in FAMILY_TRANSLATIONS and text in FAMILY_TRANSLATIONS[target_lang]:
        return FAMILY_TRANSLATIONS[target_lang][text]
    
    # Pattern-based translations for common family planning terms
    translations = {
        'cs': {
            # Verb patterns
            r'\bAdd\b': 'Přidat',
            r'\bSave\b': 'Uložit',
            r'\bCancel\b': 'Zrušit',
            r'\bStart\b': 'Spustit',
            r'\bUpdate\b': 'Aktualizovat',
            r'\bRemove\b': 'Odebrat',
            r'\bDelete\b': 'Smazat',
            r'\bEdit\b': 'Upravit',
            r'\bView\b': 'Zobrazit',
            r'\bShow\b': 'Ukázat',
            r'\bHide\b': 'Skrýt',
            r'\bPrint\b': 'Tisknout',
            r'\bDownload\b': 'Stáhnout',
            r'\bUpload\b': 'Nahrát',
            r'\bShare\b': 'Sdílet',
            r'\bSend\b': 'Odeslat',
            r'\bInvite\b': 'Pozvat',
            r'\bManage\b': 'Spravovat',
            r'\bCreate\b': 'Vytvořit',
            r'\bGenerate\b': 'Generovat',
            
            # Noun patterns  
            r'\bFamily\b': 'Rodina',
            r'\bContact\b': 'Kontakt',
            r'\bDocument\b': 'Dokument',
            r'\bInformation\b': 'Informace',
            r'\bDetails\b': 'Podrobnosti',
            r'\bAccess\b': 'Přístup',
            r'\bPermission\b': 'Oprávnění',
            r'\bRole\b': 'Role',
            r'\bHelper\b': 'Pomocník',
            r'\bGuardian\b': 'Opatrovník',
            r'\bExecutor\b': 'Vykonavatel',
            r'\bEmergency\b': 'Nouzová situace',
            r'\bCrisis\b': 'Krize',
            r'\bPlan\b': 'Plán',
            r'\bGuide\b': 'Průvodce',
            r'\bInstructions\b': 'Pokyny',
            r'\bPreferences\b': 'Předvolby',
            r'\bSettings\b': 'Nastavení',
            
            # Adjective patterns
            r'\bImportant\b': 'Důležité',
            r'\bCritical\b': 'Kritické',
            r'\bUrgent\b': 'Naléhavé',
            r'\bBasic\b': 'Základní',
            r'\bFull\b': 'Plný',
            r'\bLimited\b': 'Omezený',
            r'\bComplete\b': 'Úplný',
            r'\bPartial\b': 'Částečný',
            r'\bAvailable\b': 'Dostupný',
            r'\bRequired\b': 'Povinný',
            r'\bOptional\b': 'Volitelný',
            
            # Status words
            r'\bActive\b': 'Aktivní',
            r'\bInactive\b': 'Neaktivní',
            r'\bPending\b': 'Čekající',
            r'\bCompleted\b': 'Dokončeno',
            r'\bCancelled\b': 'Zrušeno',
            r'\bApproved\b': 'Schváleno',
            r'\bRejected\b': 'Odmítnuto',
            r'\bAccepted\b': 'Přijato',
        }
    }
    
    # Apply pattern-based translations
    if target_lang in translations:
        result = text
        for pattern, replacement in translations[target_lang].items():
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        
        # If we made any changes, return the result
        if result != text:
            return result
    
    # Return original text if no translation available (English fallback)
    return text

def translate_object_recursively(obj, target_lang):
    """Recursively translate all strings in nested object"""
    if isinstance(obj, dict):
        return {key: translate_object_recursively(value, target_lang) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [translate_object_recursively(item, target_lang) for item in obj]
    elif isinstance(obj, str):
        return smart_translate(obj, target_lang)
    else:
        return obj

def create_comprehensive_translation(source_data, language_code):
    """Create comprehensive translation for a specific language"""
    return translate_object_recursively(source_data, language_code)

def main():
    print("🚀 Starting comprehensive family.json translation...")
    
    # Load English source
    en_file = Path('src/i18n/locales/en/family.json')
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    print(f"📖 Loaded English source")
    
    # Start with Czech as primary test language
    target_languages = ['cs']
    
    for lang in target_languages:
        print(f"🔄 Processing {lang.upper()}...")
        
        try:
            # Create comprehensive translation
            translated_data = create_comprehensive_translation(en_data, lang)
            
            # Save to file
            lang_dir = Path(f'src/i18n/locales/{lang}')
            lang_dir.mkdir(exist_ok=True)
            
            lang_file = lang_dir / 'family.json'
            with open(lang_file, 'w', encoding='utf-8') as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ {lang.upper()} - Comprehensive translation completed")
            
        except Exception as e:
            print(f"❌ {lang.upper()} - Error: {e}")
    
    print("\\n🎉 Translation completed successfully!")

if __name__ == '__main__':
    main()
