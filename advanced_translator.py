#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Advanced comprehensive translator for family.json
Complete translation coverage for family planning application
"""

import json
import re
from pathlib import Path

# Comprehensive translation database for all family planning terms
COMPLETE_FAMILY_TRANSLATIONS = {
    'cs': {
        # Core access and permissions
        'They can help your family only in emergencies': 'Mohou pomoci vaší rodině pouze v nouzových situacích',
        'They can manage everything to help your family': 'Mohou spravovat vše, aby pomohli vaší rodině',
        'They can see and manage all your family\'s information': 'Mohou vidět a spravovat všechny informace o vaší rodině',
        'They can see basic contact info and emergency instructions': 'Mohou vidět základní kontaktní informace a nouzové pokyny',
        'They can see most of what your family would need': 'Mohou vidět většinu toho, co by vaše rodina potřebovala',
        
        'Only in Emergencies': 'Pouze v nouzových situacích',
        'Full Helper Access': 'Plný pomocný přístup',
        'Can See Everything': 'Může vidět vše',
        'Basic Information Only': 'Pouze základní informace',
        'Regular Family Access': 'Běžný rodinný přístup',
        
        'Can Make Changes': 'Může provádět změny',
        'Emergency Access Rights': 'Práva nouzového přístupu',
        'Can Manage Other Helpers': 'Může spravovat další pomocníky',
        'Gets Important Updates': 'Dostává důležité aktualizace',
        'Can See Your Important Things': 'Může vidět vaše důležité věci',
        'Can See Contact Information': 'Může vidět kontaktní informace',
        'Can Read Documents': 'Může číst dokumenty',
        
        # All action texts
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
        
        # Communication and coordination
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
        
        # Crisis and emergency management
        'Critical vulnerabilities': 'Kritické zranitelnosti',
        'Family capabilities': 'Rodinné schopnosti',
        'Family discussion': 'Rodinná diskuse',
        'Family discussion description': 'Popis rodinné diskuse',
        'Fix capability': 'Opravit schopnost',
        'Fix now': 'Opravit nyní',
        'Missing': 'Chybí',
        'Most urgent': 'Nejnaléhavější',
        'Next critical action': 'Další kritická akce',
        'Not prepared': 'Nepřipravený',
        'Partial': 'Částečný',
        'Prepared': 'Připravený',
        'Print report': 'Vytisknout zprávu',
        'Protected': 'Chráněný',
        'Schedule review': 'Naplánovat přehled',
        'Situation readiness': 'Připravenost na situaci',
        'Time estimate': 'Časový odhad',
        'Vulnerable': 'Zranitelný',
        
        # Crisis situations
        'Description': 'Popis',
        'Title': 'Název',
        'Subtitle': 'Podtitul',
        
        # Emergency contacts
        'Add contact': 'Přidat kontakt',
        'Add button': 'Tlačítko přidat',
        'Relationship': 'Vztah',
        'Relationship placeholder': 'Zástupný text pro vztah',
        'Select contact': 'Vybrat kontakt',
        'Select placeholder': 'Zástupný text výběru',
        'Add failed': 'Přidání selhalo',
        'Load failed': 'Načtení selhalo',
        'Remove failed': 'Odebrání selhalo',
        'Reorder failed': 'Přeřazení selhalo',
        'Test failed': 'Test selhal',
        'Last contacted': 'Naposledy kontaktován',
        'Max contacts reached': 'Dosažen maximální počet kontaktů',
        'Added': 'Přidáno',
        'Removed': 'Odebráno',
        'Reordered': 'Přeřazeno',
        'Test sent': 'Test odeslán',
        'No contacts': 'Žádné kontakty',
        'Send test': 'Odeslat test',
        
        # Estate status
        'Update': 'Aktualizovat',
        'Updating': 'Aktualizace',
        'No status': 'Žádný stav',
        'Read only': 'Pouze pro čtení',
        'Additional details': 'Další podrobnosti',
        'Status': 'Stav',
        'Last updated': 'Naposledy aktualizováno',
        'Log action': 'Zaznamenat akci',
        'Additional context': 'Další kontext',
        'Select status': 'Vybrat stav',
        'Progress': 'Pokrok',
        'Assets being valued': 'Majetek se oceňuje',
        'Debts being settled': 'Dluhy se vyřizují',
        'Distribution in progress': 'Rozdělování probíhá',
        'Estate closed': 'Dědictví uzavřeno',
        'Gathering documents': 'Shromažďování dokumentů',
        'Initial review': 'Počáteční přehled',
        'Probate initiated': 'Ověřování zahájeno',
        'Ready for distribution': 'Připraveno k rozdělení',
        'Tax preparation': 'Příprava daní',
        'Update status': 'Aktualizovat stav',
        
        # Executor tasks and management
        'Completed': 'Dokončeno',
        'Reminder': 'Připomínka',
        'Due': 'Splatné',
        'Load tasks failed': 'Načtení úkolů selhalo',
        'Update task failed': 'Aktualizace úkolu selhala',
        'High priority': 'Vysoká priorita',
        'Button': 'Tlačítko',
        'Mark complete': 'Označit jako dokončené',
        'Empty': 'Prázdné',
        'Completed': 'Dokončené',
        'Remaining': 'Zbývající',
        'Total tasks': 'Celkem úkolů',
        'Undo': 'Vrátit zpět',
        'View account details': 'Zobrazit detaily účtu',
        'View related documents': 'Zobrazit související dokumenty',
        
        # Executor management  
        'Add new executor': 'Přidat nového vykonavatele',
        'All executors must have legacy': 'Všichni vykonavatelé musí mít LegacyGuard',
        'Current executors': 'Současní vykonavatelé',
        'Designate trusted individuals': 'Určit důvěryhodné jednotlivce',
        'Email address': 'Emailová adresa',
        'Emergency contact': 'Nouzový kontakt',
        'Emergency contacts are notified': 'Nouzové kontakty jsou upozorněny',
        'Executor management': 'Správa vykonavatelů',
        'Failed to add executor': 'Selhalo přidání vykonavatele',
        'Failed to load executors': 'Selhalo načtení vykonavatelů',
        'Failed to remove executor': 'Selhalo odebrání vykonavatele',
        'Important information': 'Důležité informace',
        'Loading executors': 'Načítání vykonavatelů',
        'No executors designated yet add': 'Ještě nejsou určeni žádní vykonavatelé, přidejte',
        'Primary executor': 'Hlavní vykonavatel',
        'Primary executors receive immediate': 'Hlavní vykonavatelé dostávají okamžitě',
        'Relationship type': 'Typ vztahu',
        'Secondary executor': 'Vedlejší vykonavatel',
        'Secondary executors are notified': 'Vedlejší vykonavatelé jsou upozorněni',
        'Add executor': 'Přidat vykonavatele',
        'Adding': 'Přidávání',
        'Unknown user': 'Neznámý uživatel',
        'Executor added': 'Vykonavatel přidán',
        'Executor removed': 'Vykonavatel odebrán',
        'This person is already designated': 'Tato osoba už je určena',
        'User not found with this email': 'Uživatel s tímto emailem nenalezen',
        
        # Family hub and members
        'Authentication required': 'Vyžadována autentizace',
        'Failed to fetch data': 'Selhalo načtení dat',
        'Failed to load members': 'Selhalo načtení členů',
        'Add more people': 'Přidat více lidí',
        'Add trusted person': 'Přidat důvěryhodnou osobu',
        'Days ago': 'Dnů zpět',
        'Information access level': 'Úroveň přístupu k informacím',
        'Last contact over 30 days': 'Poslední kontakt před více než 30 dny',
        'Preparedness': 'Připravenost',
        'Send update': 'Odeslat aktualizaci',
        'Send update to': 'Odeslat aktualizaci pro',
        'Access level updated': 'Úroveň přístupu aktualizována',
        'Failed to send update': 'Selhalo odeslání aktualizace',
        'Update sent to': 'Aktualizace odeslána pro',
        'Improvement needed': 'Potřebné zlepšení',
        'Family members': 'Členové rodiny',
        'Members': 'Členové',
        'Preparedness tools': 'Nástroje připravenosti',
        'Tools': 'Nástroje',
        
        # Family preparedness tools
        'Create a printable guide for y 3': 'Vytvořit tiskový průvodce pro 3',
        'Coming soon': 'Již brzy',
        'Generate failed': 'Generování selhalo',
        'Premium required': 'Vyžadována prémiová verze',
        'Select scenario': 'Vyberte scénář',
        'Generate another 5': 'Generovat další 5',
        'Generate emergency guide 2': 'Generovat nouzový průvodce 2',
        'Select scenario 4': 'Vybrat scénář 4',
        'Choose scenario': 'Vybrat scénář',
        'Emergency simulator': 'Simulátor nouzových situací',
        'Emergency simulator desc': 'Popis simulátoru nouzových situací',
        'Generate guide': 'Generovat průvodce',
        'Generating': 'Generování',
        'Information treasure hunt': 'Poklad informací',
        'Launch': 'Spustit',
        'Print guide': 'Tisknout průvodce',
        'Step by step guides': 'Průvodci krok za krokem',
        'Step by step guides desc': 'Popis průvodců krok za krokem',
        'Treasure hunt desc': 'Popis hledání pokladu',
        'Video messages': 'Video zprávy',
        'Video messages desc': 'Popis video zpráv',
        'Use these tools to ensure your 1': 'Použijte tyto nástroje k zajištění vašeho 1',
        
        # Guardian functionality
        'Accepted': 'Přijato',
        'Declined': 'Odmítnuto',
        'Invitation sent': 'Pozvánka odeslána',
        'Send invite': 'Odeslat pozvánku',
        'Default user name': 'Výchozí jméno uživatele',
        'Access failed': 'Přístup selhal',
        'Access granted': 'Přístup povolen',
        'Accessing': 'Přistupování',
        'Confirm button': 'Tlačítko potvrzení',
        'Confirm checkbox': 'Zaškrtávací políčko potvrzení',
        'Contact logged': 'Kontakt zaznamenán',
        'Contacts description': 'Popis kontaktů',
        'Contacts title': 'Název kontaktů',
        'Failed to load contacts': 'Selhalo načtení kontaktů',
        'Important note': 'Důležitá poznámka',
        'Log contact': 'Zaznamenat kontakt',
        'Modal description': 'Popis modálu',
        'Modal title': 'Název modálu',
        'Not authorized': 'Neautorizováno',
        'Please confirm': 'Potvrďte prosím',
        'Priority': 'Priorita',
        'Priority order': 'Pořadí priority',
        'Reason label': 'Štítek důvodu',
        'Reason placeholder': 'Zástupný text důvodu',
        'Warning text': 'Varovný text',
        'Failed to load': 'Selhalo načtení',
        'Please login': 'Přihlaste se prosím',
        'Security note': 'Bezpečnostní poznámka',
        'Read only access': 'Přístup pouze pro čtení',
        'Digital accounts': 'Digitální účty',
        'Funeral wishes': 'Pohřební přání',
        'Messages to loved ones': 'Zprávy blízkým',
        'Important contacts': 'Důležité kontakty',
        'Key documents': 'Klíčové dokumenty',
        'Expires': 'Vyprší',
        'Key document badge': 'Odznak klíčového dokumentu',
        'No expiration': 'Bez vypršení',
        
        # Guardianship
        'Add Someone Who Needs Care': 'Přidejte někoho, kdo potřebuje péči',
        'Backup Caregiver': 'Záložní opatrovník',
        'How You Want Them Cared For': 'Jak chcete, aby o ně bylo pečováno',
        'Who will care for your children': 'Kdo se bude starat o vaše děti',
        'Plans for caring for your loved ones': 'Plány péče pro vaše blízké',
        'Choose loving people who will care for your children or family members who need help if you can\'t be there.': 'Vyberte milující lidi, kteří se budou starat o vaše děti nebo rodinné příslušníky potřebující pomoc, pokud tam nemůžete být.',
        'School and education wishes': 'Přání ohledně školy a vzdělání',
        'Money for their care': 'Peníze na jejich péči',
        'Support for the caregiver': 'Podpora pro opatrovníka',
        'Who will care for {{name}}': 'Kdo se bude starat o {{name}}',
        'How to care for them': 'Jak se o ně starat',
        'Why they\'re the right choice': 'Proč jsou správnou volbou',
        'Health and medical care': 'Zdravotní a lékařská péče',
        'Daily life and activities': 'Každodenní život a aktivity',
        'We haven\'t told us about any children or family members who need care yet.': 'Ještě jste nám neřekli o žádných dětech nebo rodinných příslušnících, kteří potřebují péči.',
        'First choice caregiver': 'První volba opatrovníka',
        'Faith and values': 'Víra a hodnoty',
        'Keeping the family informed': 'Udržování rodiny v obraze',
        'Ensuring care for your loved ones': 'Zajištění péče o vaše blízké',
        'Short-term caregiver': 'Krátkodobý opatrovník',
        'Who will care for your loved ones': 'Kdo se bude starat o vaše blízké',
        'Family visiting arrangements': 'Rodinné návštěvní dohody',
        
        # Invitation acceptance
        'Accept role': 'Přijmout roli',
        'Decline': 'Odmítnout',
        'Processing': 'Zpracování',
        'Default inviter name': 'Výchozí jméno pozvaného',
        'Disclaimer': 'Zřeknutí se odpovědnosti',
        'Accept failed': 'Přijetí selhalo',
        'Already processed': 'Už zpracováno',
        'Decline failed': 'Odmítnutí selhalo',
        'Invalid link': 'Neplatný odkaz',
        'Loading failed': 'Načtení selhalo',
        'Not found': 'Nenalezeno',
        'Your name': 'Vaše jméno',
        'Responsibilities': 'Odpovědnosti',
        
        # Notifications and preferences
        'Email required': 'Email vyžadován',
        'Load failed': 'Načtení selhalo',
        'Update failed': 'Aktualizace selhala',
        'How it works': 'Jak to funguje',
        'Point1': 'Bod1',
        'Point2': 'Bod2',
        'Point3': 'Bod3',
        'Info': 'Informace',
        'Updated': 'Aktualizováno',
        
        # Playbook sections
        'Add contact': 'Přidat kontakt',
        'Auto save notice': 'Upozornění na automatické ukládání',
        'Contact': 'Kontakt',
        'Email label': 'Štítek emailu',
        'Email placeholder': 'Zástupný text emailu',
        'Name label': 'Štítek jména',
        'Name placeholder': 'Zástupný text jména',
        'Notes label': 'Štítek poznámek',
        'Notes placeholder': 'Zástupný text poznámek',
        'Phone label': 'Štítek telefonu',
        'Phone placeholder': 'Zástupný text telefonu',
        'Role label': 'Štítek role',
        'Role placeholder': 'Zástupný text role',
        'Update button': 'Tlačítko aktualizace',
        'Edit': 'Upravit',
        'Save failed': 'Uložení selhalo',
        'Auto saved': 'Automaticky uloženo',
        'Saved': 'Uloženo',
        'No content': 'Žádný obsah',
        'Preview': 'Náhled',
        'Contacts': 'Kontakty',
        'Digital': 'Digitální',
        'Documents': 'Dokumenty',
        'Funeral': 'Pohřeb',
        'Instructions': 'Pokyny',
        'Messages': 'Zprávy',
        'Practical': 'Praktické',
        'Complete': 'Dokončeno',
        'Draft': 'Koncept',
        'Append': 'Připojit',
        'Back to templates': 'Zpět k šablonám',
        'Existing content': 'Existující obsah',
        'Fill in variables': 'Vyplnit proměnné',
        'Insert template': 'Vložit šablonu',
        'Replace': 'Nahradit',
        'Variable count': 'Počet proměnných',
        'Variable placeholder': 'Zástupný text proměnné',
        'Use template': 'Použít šablonu',
        'Access denied': 'Přístup odepřen',
        'Create': 'Vytvořit',
        'Digital accounts': 'Digitální účty',
        'Label': 'Štítek',
        'Placeholder': 'Zástupný text',
        'Discard changes': 'Zahodit změny',
        'Confirm': 'Potvrdit',
        'Document locations': 'Umístění dokumentů',
        'Exit preview': 'Ukončit náhled',
        'Fetch error': 'Chyba načítání',
        'Funeral wishes': 'Pohřební přání',
        'Important contacts': 'Důležité kontakty',
        'Add': 'Přidat',
        'Relationship placeholder': 'Zástupný text vztahu',
        'Remove': 'Odebrat',
        'View description': 'Popis zobrazení',
        'Not authenticated': 'Neautentizován',
        'Personal messages': 'Osobní zprávy',
        'Practical instructions': 'Praktické pokyny',
        'Save error': 'Chyba ukládání',
        'Save success': 'Úspěšně uloženo',
        'Title read only': 'Název pouze pro čtení',
        'View footer': 'Zápatí zobrazení',
        'View title': 'Název zobrazení',
        
        # Preparedness assessment
        'Good': 'Dobré',
        'Needs work': 'Potřebuje práci',
        'Decision making': 'Rozhodování',
        'Immediate access': 'Okamžitý přístup',
        'Long term security': 'Dlouhodobá bezpečnost',
        'Family benefit': 'Rodinný přínos',
        'Schedule review': 'Naplánovat přehled',
        'Share report': 'Sdílet zprávu',
        'Add medical preferences': 'Přidat lékařské preference',
        'Basic access info': 'Základní informace o přístupu',
        'Complete financial access': 'Dokončit finanční přístup',
        'Document business operations': 'Dokumentovat obchodní operace',
        'Improve immediate access': 'Zlepšit okamžitý přístup',
        'Update will and trust': 'Aktualizovat závěť a svěřenský fond',
        'Impact': 'Dopad',
        'Add bank accounts': 'Přidat bankovní účty',
        'Document medical wishes': 'Dokumentovat lékařská přání',
        'Upload legal documents': 'Nahrát právní dokumenty',
        'Fully prepared': 'Plně připraven',
        'Good basic': 'Dobrý základ',
        'Minimal preparation': 'Minimální příprava',
        'Needs immediate': 'Potřebuje okamžité',
        'Some preparation': 'Nějaká příprava',
        'Well prepared': 'Dobře připraven',
        'Next step': 'Další krok',
        'Scenario readiness': 'Připravenost na scénář',
        'To improve': 'K zlepšení',
        
        # Relationships and roles
        'Child': 'Dítě',
        'Friend': 'Přítel',
        'Other': 'Jiné',
        'Parent': 'Rodič',
        'Sibling': 'Sourozenec',
        'Spouse': 'Manžel/manželka',
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
        
        # Trusted circle
        'Add Someone Who Can Help': 'Přidejte někoho, kdo může pomoci',
        'Choose people who can support your family when they need it most. These are the people your loved ones can turn to.': 'Vyberte lidy, kteří mohou podpořit vaši rodinu, když to nejvíce potřebuje. To jsou lidé, na které se vaši blízzcí mohou obrátit.',
        'People to Call First': 'Lidé, kterým zavolat jako prvním',
        'Let\'s start by adding someone your family can count on - maybe your spouse, a close friend, or a trusted family member.': 'Začněme přidáním někoho, na koho se vaše rodina může spolehnout - možná vašeho manžela/manželku, blízkého přítele nebo důvěryhodného rodinného příslušníka.',
        'Your most important helpers': 'Vaši nejdůležitější pomocníci',
        'Recently added': 'Nedávno přidaní',
        'How they can help': 'Jak mohou pomoci',
        'People who can be there for your family': 'Lidé, kteří tu budou pro vaši rodinu',
        'Your Family\'s Support Team': 'Podpůrný tým vaší rodiny',
        '{{count}} people ready to help': '{{count}} lidí připravených pomoci',
        'View all': 'Zobrazit všechny',
        
        # Family structures and complexity
        'Traditional Family': 'Tradiční rodina',
        'Single Parent Family': 'Jednořodičovská rodina',
        'Blended Family': 'Smíšená rodina',
        'Multi-generational Family': 'Vícegenerační rodina',
        'Couple without Children': 'Pár bez dětí',
        'Empty Nest Family': 'Rodina prázdného hnízda',
        'Unique Family Structure': 'Jedinečná rodinná struktura',
        'Simple': 'Jednoduché',
        'Moderate': 'Střední',
        'Complex': 'Složité',
        'Your personalized family planning experience': 'Vaše personalizované rodinné plánovací zkušenost',
        'Family Members': 'Členové rodiny',
        'Special Considerations': 'Speciální úvahy',
        'Recommended Features': 'Doporučené funkce',
        'Overview': 'Přehled',
        'Insights': 'Pozorování',
        'Features': 'Funkce',
        'Cultural': 'Kulturní',
        'Key considerations for your family': 'Klíčové úvahy pro vaši rodinu',
        'Special planning needs': 'Speciální plánovací potřeby',
        'Areas requiring special care': 'Oblasti vyžadující zvláštní péči',
        
        # Priority levels
        'High Priority': 'Vysoká priorita',
        'Medium Priority': 'Střední priorita',
        'Low Priority': 'Nízká priorita',
        'Suggested actions': 'Navrhované akce',
        'Features tailored to your family': 'Funkce přizpůsobené vaší rodině',
        'Based on your family structure and needs, these features will be most useful': 'Na základě vaší rodinné struktury a potřeb budou tyto funkce nejužitečnější',
        
        # Communication styles
        'Direct & Clear': 'Přímý a jasný',
        'Straightforward communication that gets to the point quickly': 'Přímočará komunikace, která rychle míří k podstatě',
        'Gentle & Supportive': 'Jemný a podporující',
        'Careful, empathetic communication that acknowledges sensitivities': 'Opatrná, empatická komunikace, která uznává citlivosti',
        'Detailed & Comprehensive': 'Podrobný a komplexní',
        'Thorough explanations with all the important details': 'Důkladná vysvětlení se všemi důležitými detaily',
        'Simplified & Essential': 'Zjednodušený a podstatný',
        'Focus on the most important information without overwhelming detail': 'Zaměření na nejdůležitější informace bez přemíry detailů',
        
        # Cultural considerations
        'Cultural and religious considerations': 'Kulturní a náboženské úvahy',
        'Honor your family\'s values and traditions in your planning': 'Ctěte hodnoty a tradice vaší rodiny ve vašem plánování',
        'Islamic inheritance principles': 'Islámské principy dědictví',
        'Jewish family traditions': 'Židovské rodinné tradice',
        'Christian stewardship values': 'Křesťanské hodnoty správcovství',
        'Buddhist compassion principles': 'Buddhistické principy soucitu',
        'Traditional patriarchal structure': 'Tradiční patriarchální struktura',
        'Traditional matriarchal structure': 'Tradiční matriarchální struktura',
        'Elder-led structure': 'Struktura vedená seniory',
        'Collective family decisions': 'Kolektivní rodinná rozhodnutí',
        'Extended family obligations': 'Závazky k rozšířené rodině',
        'Elder respect obligations': 'Závazky úcty k seniorům',
        'Multilingual documentation needs': 'Potřeby vícejazyčné dokumentace',
        'No cultural settings configured': 'Nejsou nastaveny žádné kulturní preference. Přidejte je, abyste zajistili, že vaše plánování respektuje hodnoty vaší rodiny.',
        'Configure cultural preferences': 'Konfigurovat kulturní preference',
        'Cultural preferences updated': 'Kulturní preference aktualizovány',
        'Your family planning will now reflect your cultural values and traditions': 'Vaše rodinné plánování nyní bude odrážet vaše kulturní hodnoty a tradice',
        
        # Additional UI elements
        'Cancel': 'Zrušit',
        'Save': 'Uložit',
        'Start': 'Spustit',
        'Fix': 'Opravit',
        'Loading': 'Načítání',
        'Error': 'Chyba',
        'Success': 'Úspěch',
        'Email': 'Email',
        'Phone': 'Telefon',
        'Name': 'Jméno',
        'Minutes': 'Minuty',
        'Saving': 'Ukládání',
        'Date': 'Datum',
        'Subject': 'Předmět',
        'Summary': 'Shrnutí',
        'Type': 'Typ',
        'In person': 'Osobně',
        'Letter': 'Dopis',
        'Beneficiary name': 'Jméno příjemce',
        'Log communication': 'Zaznamenat komunikaci',
        
        # Form elements
        'What they can see and when they can help': 'Co mohou vidět a kdy mohou pomoci',
        'What They Can Do': 'Co mohou dělat',
        'How Much They Can See': 'Kolik mohou vidět',
        'Add someone to help': 'Přidat někoho k pomoci',
        'Additional ways they can help': 'Další způsoby, jak mohou pomoci',
        'Alternative phone number': 'Jiné telefonní číslo',
        'How they will help your family': 'Jak budou pomáhat vaší rodině',
        'They are backup for': 'Jsou zálohou pro',
        'Who they step in for if needed': 'Za koho nastoupí, pokud bude potřeba',
        'Why they\'re right for this': 'Proč jsou vhodní pro toto',
        'What makes them a good choice to help?': 'Co z nich dělá dobrou volbu k pomoci?',
        'If they need support': 'Pokud potřebují podporu',
        'Any financial help they might need': 'Jakákoli finanční pomoc, kterou by mohli potřebovat',
        'How to contact them': 'Jak je kontaktovat',
        'Their birthday': 'Jejich narozeniny',
        'Update their information': 'Aktualizovat jejich informace',
        'Their full name': 'Jejich celé jméno',
        'Use their legal name for important documents': 'Použijte jejich právní jméno pro důležité dokumenty',
        'Their complete legal name': 'Jejich úplné právní jméno',
        'Where they live': 'Kde bydlí',
        'Important things they should know': 'Důležité věci, které by měli vědět',
        'Any special instructions for helping your family': 'Jakékoliv speciální pokyny pro pomoc vaší rodině',
        'What they need to know to help': 'Co potřebují vědět, aby pomohli',
        'Things to be aware of': 'Věci, kterých si být vědomi',
        'Anything that might make it harder for them to help': 'Cokoliv, co by jim mohlo ztížit pomoci',
        'About them': 'O nich',
        'Best phone number': 'Nejlepší telefonní číslo',
        'Main way they will help': 'Hlavní způsob, jak budou pomáhat',
        'How you know them': 'Jak je znáte',
        'Like spouse, child, sibling, best friend': 'Jako manžel/manželka, dítě, bratr/sestra, nejlepší přítel',
        'How they will help': 'Jak budou pomáhat',
        'Choose how they can help your family': 'Vyberte, jak mohou pomoci vaší rodině',
        'Where they work': 'Kde pracují',
        
        # Error messages
        'You can\'t change this person\'s information right now': 'Nemůžete právě teď měnit informace této osoby',
        'We couldn\'t give them this role. Let\'s try again.': 'Nemohli jsme jim přiřadit tuto roli. Zkusme to znovu.',
        'We couldn\'t find that information': 'Nemohli jsme najít tyto informace',
        'This person is already on your support team': 'Tato osoba už je ve vašem podpůrném týmu',
        'This is already saved': 'Toto už je uloženo',
        'We couldn\'t give them access. Let\'s try again.': 'Nemohli jsme jim poskytnout přístup. Zkusme to znovu.',
        'That email doesn\'t look right - please check it': 'Ten email nevypadá správně - zkontrolujte ho prosím',
        'That phone number doesn\'t look right - please check it': 'To telefonní číslo nevypadá správně - zkontrolujte ho prosím',
        'We had trouble loading your support team. Please refresh the page.': 'Měli jsme problém s načtením vašeho podpůrného týmu. Obnovte prosím stránku.',
        'Connection issue - please check your internet': 'Problém s připojením - zkontrolujte prosím internet',
        'You don\'t have permission for this action': 'Nemáte oprávnění k této akci',
        'We couldn\'t remove them from your team. Let\'s try again.': 'Nemohli jsme je odebrat z vašeho týmu. Zkusme to znovu.',
        'They already have another role that conflicts with this one': 'Už mají jinou roli, která je v konfliktu s touto',
        'We couldn\'t save their information. Please check everything and try again.': 'Nemohli jsme uložit jejich informace. Zkontrolujte prosím vše a zkuste znovu.',
        'We couldn\'t send the invitation. Please check their email and try again.': 'Nemohli jsme odeslat pozvánku. Zkontrolujte prosím jejich email a zkuste znovu.',
        'Something went wrong': 'Něco se pokazilo',
        
        # Notification messages
        '{{name}} can now help your family': '{{name}} nyní může pomáhat vaší rodině',
        '{{name}}\'s access has been updated': 'Přístup {{name}} byl aktualizován',
        'Great news! {{name}} is ready to help': 'Skvělé zprávy! {{name}} je připraven pomáhat',
        'We\'ve invited {{name}} to join your support team': 'Pozvali jsme {{name}}, aby se připojil k vašemu podpůrnému týmu',
        '{{name}} is now part of your family\'s support team': '{{name}} je nyní součástí podpůrného týmu vaší rodiny',
        '{{name}} is no longer on your support team': '{{name}} už není ve vašem podpůrném týmu',
        'We\'ve updated {{name}}\'s information': 'Aktualizovali jsme informace o {{name}}',
        'You\'ll meet with {{name}} to discuss family plans': 'Setkáte se s {{name}} a budete diskutovat o rodinných plánech',
        '{{name}} can now help as your {{role}}': '{{name}} nyní může pomáhat jako váš {{role}}',
        '{{name}} is no longer serving as {{role}}': '{{name}} už neslouží jako {{role}}',
        
        # Special keys that appear multiple times
        '1': '1',
        '15 1': '15 1',
        'Professional guidance 1': 'Profesionální vedení 1',
        'executor@example.com 12': 'executor@example.com 12',
        'Emergency contacts 1': 'Nouzové kontakty 1',
        'Export guide 4': 'Export průvodce 4',
        'Important documents 2': 'Důležité dokumenty 2',
        'Last updated 6': 'Naposledy aktualizováno 6',
        'Share with family 5': 'Sdílet s rodinou 5',
        'What to do when 3': 'Co dělat když 3',
        'View': 'Zobrazit',
        'Generate guide': 'Generovat průvodce',
        'Discrete mode': 'Diskrétní režim',
        'Discrete mode desc': 'Popis diskrétního režimu',
    }
}

def is_technical_identifier(text):
    """Check if text is technical CSS/HTML and should not be translated"""
    if not isinstance(text, str):
        return False
    
    # CSS class patterns and technical identifiers
    technical_patterns = [
        r'^[a-z-]+(?:\s+[a-z-]+)*$',  # CSS classes
        r'className\.|htmlFor\.|id\.',  # React/HTML attributes  
        r'min-h-|grid-cols-|flex|items-|justify-|space-|text-|bg-|border-|rounded-|shadow-|hover-|focus-',  # Tailwind
        r'^\d+\s+\d+$|^_\d+$',  # Numbers like "15 1" or "_1"
        r'^tel:|^mailto:',  # URLs
        r'\$\{[^}]+\}',  # Template literals
        r'^[a-z]+\[?\d*\]?$',  # Simple IDs
        r'animate-|prose-|max-w-|container|mx-auto|px-|py-|mb-|mt-|w-|h-',  # More Tailwind
    ]
    
    for pattern in technical_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False

def translate_string(text, target_language):
    """Translate a string with comprehensive coverage"""
    if not isinstance(text, str) or not text.strip():
        return text
    
    # Skip technical CSS/HTML identifiers
    if is_technical_identifier(text):
        return text
    
    # Direct translation lookup
    if target_language in COMPLETE_FAMILY_TRANSLATIONS:
        translation_dict = COMPLETE_FAMILY_TRANSLATIONS[target_language]
        if text in translation_dict:
            return translation_dict[text]
    
    # Return original if no translation (English fallback)
    return text

def translate_nested_object(obj, target_language):
    """Recursively translate all strings in nested structure"""
    if isinstance(obj, dict):
        return {key: translate_nested_object(value, target_language) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [translate_nested_object(item, target_language) for item in obj]
    elif isinstance(obj, str):
        return translate_string(obj, target_language)
    else:
        return obj

def create_comprehensive_family_translation(source_data, language_code):
    """Create the most comprehensive translation possible"""
    return translate_nested_object(source_data, language_code)

def main():
    print("🎯 Advanced comprehensive family.json translator")
    
    # Load English source
    en_file = Path('src/i18n/locales/en/family.json')
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    print(f"📚 English source loaded")
    
    # Test with Czech first, then expand to all languages
    test_languages = ['cs']
    
    for lang in test_languages:
        print(f"🔄 Creating comprehensive {lang.upper()} translation...")
        
        try:
            # Create translation with maximum coverage
            translated_data = create_comprehensive_family_translation(en_data, lang)
            
            # Save translation
            lang_dir = Path(f'src/i18n/locales/{lang}')
            lang_dir.mkdir(exist_ok=True)
            
            lang_file = lang_dir / 'family.json'
            with open(lang_file, 'w', encoding='utf-8') as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ {lang.upper()} - Advanced translation completed")
            
        except Exception as e:
            print(f"❌ {lang.upper()} - Error: {e}")
    
    print("\\n🚀 Advanced translation process completed!")

if __name__ == '__main__':
    main()
