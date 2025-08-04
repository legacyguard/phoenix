-- Insert or update Czech will templates
-- Run this script in your Supabase SQL editor

-- First, ensure the will_templates table exists
-- If it doesn't exist, you need to run the migration: 20250730_create_will_templates.sql

-- Check if templates already exist and update or insert accordingly

-- Czech Holographic Will (Vlastnoruční)
INSERT INTO will_templates (
    country_code,
    language_code,
    template_name,
    template_body,
    execution_instructions,
    legal_guidance,
    is_active,
    version,
    created_at,
    updated_at
) VALUES (
    'CZ',
    'cs',
    'Czech Holographic Will (Vlastnoruční)',
    'Závěť

Já, níže podepsaný/á {{full_name}}, narozen/a {{date_of_birth}}, bytem {{address}}, prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat, a že tuto závěť činím s rozvahou, vážně a bez donucení.

I.
{{heir_clauses}}

II.
{{nepominutelni_dedici_clause}}
{{revocation_clause}}
Toto je má poslední vůle, pokud se dědicové nedohodnou jinak.

V {{city}} dne {{current_date}}

_______________
{{full_name}}',
    '**KRITICKÉ PRÁVNÍ POKYNY (Vlastnoruční závěť)**
1. **Napište rukou:** Celý text této závěti musíte napsat od začátku do konce **vlastní rukou** na papír. Nesmí být napsaná na počítači a vytištěná.
2. **Uveďte datum:** Na konec dokumentu napište aktuální datum.
3. **Podepište se:** Na konec dokumentu se čitelně vlastnoručně podepište.
4. **Žádní svědci:** Pro platnost této formy závěti nejsou vyžadováni žádní svědci.
5. **Uložení:** Uschovejte originál na bezpečném místě a informujte svého vykonavatele (důvěryhodnou osobu), kde jej najde.',
    '{"type": "holographic", "witnesses_required": 0, "forced_heirship": true}'::jsonb,
    true,
    1,
    NOW(),
    NOW()
)
ON CONFLICT (country_code, language_code, version) 
DO UPDATE SET
    template_name = EXCLUDED.template_name,
    template_body = EXCLUDED.template_body,
    execution_instructions = EXCLUDED.execution_instructions,
    legal_guidance = EXCLUDED.legal_guidance,
    updated_at = NOW();

-- Czech Allographic Will (Svědci)
INSERT INTO will_templates (
    country_code,
    language_code,
    template_name,
    template_body,
    execution_instructions,
    legal_guidance,
    is_active,
    version,
    created_at,
    updated_at
) VALUES (
    'CZ',
    'cs',
    'Czech Allographic Will (Svědci)',
    'Závěť

Já, níže podepsaný/á {{full_name}}, narozen/a {{date_of_birth}}, bytem {{address}}, prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat, a že tuto závěť činím s rozvahou, vážně a bez donucení.

Část A
I.
{{heir_clauses}}

II.
{{nepominutelni_dedici_clause}}
{{revocation_clause}}
Toto je má poslední vůle, pokud se dědicové nedohodnou jinak.

III.
Prohlašuji, že k podpisu této mé závěti došlo před dvěma současně přítomnými svědky, {{witness1_full_name}}, narozen/a {{witness1_date_of_birth}}, bytem {{witness1_address}}, a {{witness2_full_name}}, narozen/a {{witness2_date_of_birth}}, bytem {{witness2_address}}, a současně, že jsem prohlásil, že tato listina obsahuje moji poslední vůli.

V {{city}} dne {{current_date}}

_______________
{{full_name}}

Část B
Já, níže podepsaný/á, svědek závěti, {{witness1_full_name}}, narozen/a {{witness1_date_of_birth}}, bytem {{witness1_address}}, prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat, že jsem znalý jazyka, v němž je tento projev vůle činěn, že nejsem osobou blízkou pořizovatele této závěti, že nejsem ani dědicem z této závěti, a že jsem byl, spolu s {{witness2_full_name}} svědkem podpisu a prohlášení pořizovatele závěti o tom, že se jedná o jeho poslední vůli.

V {{city}} dne {{current_date}}

_______________
svědek
{{witness1_full_name}}

Já, níže podepsaný/á, svědek závěti, {{witness2_full_name}}, narozen/a {{witness2_date_of_birth}}, bytem {{witness2_address}}, prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat, že jsem znalý jazyka, v němž je tento projev vůle činěn, že nejsem osobou blízkou pořizovatele této závěti, že nejsem ani dědicem z této závěti, a že jsem byl, spolu s {{witness1_full_name}} svědkem podpisu a prohlášení pořizovatele závěti o tom, že se jedná o jeho poslední vůli.

V {{city}} dne {{current_date}}

_______________
svědek
{{witness2_full_name}}',
    '**KRITICKÉ PRÁVNÍ POKYNY (Závěť se svědky)**
1. **Vytiskněte:** Tento dokument můžete napsat na počítači a vytisknout.
2. **Připravte svědky:** Potřebujete dva svědky, kteří jsou přítomni **současně**. Svědci nesmí být vaši dědicové ani osoby vám blízké. Musí rozumět jazyku, v němž je závěť sepsána.
3. **Prohlášení:** Před oběma svědky musíte výslovně prohlásit, že listina obsahuje vaši poslední vůli.
4. **Podpis:** Poté se před oběma svědky vlastnoručně podepíšete.
5. **Podpisy svědků:** Ihned poté se na listinu podepíší i oba svědci a připojí doložku o své svědecké způsobilosti (jak je uvedeno v Části B).
6. **Uložení:** Uschovejte originál na bezpečném místě a informujte svého vykonavatele, kde jej najde.',
    '{"type": "allographic", "witnesses_required": 2, "forced_heirship": true}'::jsonb,
    true,
    1,
    NOW(),
    NOW()
)
ON CONFLICT (country_code, language_code, version) 
DO UPDATE SET
    template_name = EXCLUDED.template_name,
    template_body = EXCLUDED.template_body,
    execution_instructions = EXCLUDED.execution_instructions,
    legal_guidance = EXCLUDED.legal_guidance,
    updated_at = NOW();
