import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing');
  console.error('Note: Using anon key instead of service role key. This may limit permissions.');
  process.exit(1);
}

// Use anon key if service role key is not available
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

interface WillTemplateData {
  country_code: string;
  language_code: string;
  template_name: string;
  template_body: string;
  execution_instructions: string;
  legal_guidance: Record<string, any>;
}

const holographicWill: WillTemplateData = {
  country_code: 'CZ',
  language_code: 'cs',
  template_name: 'Czech Holographic Will (Vlastnoruční)',
  template_body: `Závěť

Já, níže podepsaný/á {{full_name}}, narozen/a {{date_of_birth}}, bytem {{address}}, prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně
právně jednat, a že tuto závěť činím s rozvahou, vážně a bez donucení.

I.
{{heir_clauses}}

II.
{{nepominutelni_dedici_clause}}
{{revocation_clause}}
Toto je má poslední vůle, pokud se dědicové nedohodnou jinak.

V {{city}} dne {{current_date}}

_______________
{{full_name}}`,
  execution_instructions: `**KRITICKÉ PRÁVNÍ POKYNY (Vlastnoruční závěť)**
1. **Napište rukou:** Celý text této závěti musíte napsat od začátku do konce **vlastní rukou**
na papír. Nesmí být napsaná na počítači a vytištěná.
2. **Uveďte datum:** Na konec dokumentu napište aktuální datum.
3. **Podepište se:** Na konec dokumentu se čitelně vlastnoručně podepište.
4. **Žádní svědci:** Pro platnost této formy závěti nejsou vyžadováni žádní svědci.
5. **Uložení:** Uschovejte originál na bezpečném místě a informujte svého vykonavatele
(důvěryhodnou osobu), kde jej najde.`,
  legal_guidance: { type: 'holographic', witnesses_required: 0, forced_heirship: true },
};

const allographicWill: WillTemplateData = {
  country_code: 'CZ',
  language_code: 'cs',
  template_name: 'Czech Allographic Will (Svědci)',
  template_body: `Závěť

Já, níže podepsaný/á {{full_name}}, narozen/a {{date_of_birth}}, bytem {{address}}, prohlašuji, že jsem svéprávný,
že jsem způsobilý samostatně právně jednat, a že tuto závěť činím s rozvahou, vážně a bez donucení.

Část A
I.
{{heir_clauses}}

II.
{{nepominutelni_dedici_clause}}
{{revocation_clause}}
Toto je má poslední vůle, pokud se dědicové nedohodnou jinak.

III.
Prohlašuji, že k podpisu této mé závěti došlo před dvěma současně přítomnými svědky, {{witness1_full_name}},
narozen/a {{witness1_date_of_birth}}, bytem {{witness1_address}}, a {{witness2_full_name}}, narozen/a {{witness2_date_of_birth}},
bytem {{witness2_address}}, a současně, že jsem prohlásil, že tato listina obsahuje moji poslední vůli.

V {{city}} dne {{current_date}}

_______________
{{full_name}}

Část B
Já, níže podepsaný/á, svědek závěti, {{witness1_full_name}}, narozen/a {{witness1_date_of_birth}}, bytem {{witness1_address}},
prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat, že jsem znalý jazyka, v němž je tento projev vůle činěn,
že nejsem osobou blízkou pořizovatele této závěti, že nejsem ani dědicem z této závěti, a že jsem byl, spolu s {{witness2_full_name}}
svědkem podpisu a prohlášení pořizovatele závěti o tom, že se jedná o jeho poslední vůli.

V {{city}} dne {{current_date}}

_______________
svědek
{{witness1_full_name}}

Já, níže podepsaný/á, svědek závěti, {{witness2_full_name}}, narozen/a {{witness2_date_of_birth}}, bytem {{witness2_address}},
prohlašuji, že jsem svéprávný, že jsem způsobilý samostatně právně jednat, že jsem znalý jazyka, v němž je tento projev vůle činěn,
že nejsem osobou blízkou pořizovatele této závěti, že nejsem ani dědicem z této závěti, a že jsem byl, spolu s {{witness1_full_name}}
svědkem podpisu a prohlášení pořizovatele závěti o tom, že se jedná o jeho poslední vůli.

V {{city}} dne {{current_date}}

_______________
svědek
{{witness2_full_name}}
  `,
  execution_instructions: `**KRITICKÉ PRÁVNÍ POKYNY (Závěť se svědky)**
1. **Vytiskněte:** Tento dokument můžete napsat na počítači a vytisknout.
2. **Připravte svědky:** Potřebujete dva svědky, kteří jsou přítomni **současně**.
Svědci nesmí být vaši dědicové ani osoby vám blízké. Musí rozumět jazyku, v němž je závěť sepsána.
3. **Prohlášení:** Před oběma svědky musíte výslovně prohlásit, že listina obsahuje vaši poslední vůli.
4. **Podpis:** Poté se před oběma svědky vlastnoručně podepíšete.
5. **Podpisy svědků:** Ihned poté se na listinu podepíší i oba svědci a připojí doložku o své
svědecké způsobilosti (jak je uvedeno v Části B).
6. **Uložení:** Uschovejte originál na bezpečném místě a informujte svého vykonavatele, kde jej najde.`,
  legal_guidance: { type: 'allographic', witnesses_required: 2, forced_heirship: true },
};

async function upsertWillTemplate(templateData: WillTemplateData) {
  const { country_code, template_name, ...rest } = templateData;

  console.log(`Processing template: ${template_name} for country: ${country_code}`);

  try {
    const { data: existingTemplate, error: selectError } = await supabase
      .from('will_templates')
      .select('id')
      .eq('country_code', country_code)
      .eq('template_name', template_name);

    if (selectError) {
      console.error('Error checking existing template:', selectError);
      return;
    }

    if (existingTemplate && existingTemplate.length > 0) {
      // Update existing template
      console.log(`Updating existing template with ID: ${existingTemplate[0].id}`);
      const { data, error } = await supabase
        .from('will_templates')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', existingTemplate[0].id)
        .select();

      if (error) {
        console.error('Failed to update template:', JSON.stringify(error, null, 2));
      } else {
        console.log('Template updated successfully:', data);
      }
    } else {
      // Insert new template
      console.log('Inserting new template...');
      const { data, error } = await supabase
        .from('will_templates')
        .insert([{ ...templateData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select();

      if (error) {
        console.error('Failed to insert template:', JSON.stringify(error, null, 2));
      } else {
        console.log('Template inserted successfully:', data);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

(async () => {
  await upsertWillTemplate(holographicWill);
  await upsertWillTemplate(allographicWill);
})();

