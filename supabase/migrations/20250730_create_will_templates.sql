-- Create will_templates table for multi-jurisdiction will template system
CREATE TABLE IF NOT EXISTS will_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(10) NOT NULL, -- e.g., 'FR', 'DE', 'GB-ENG', 'GB-SCT'
    language_code VARCHAR(5) NOT NULL, -- e.g., 'fr', 'de', 'en'
    template_name VARCHAR(255) NOT NULL,
    template_body TEXT NOT NULL, -- Main will text with placeholders like {{full_name}}, {{assets_list}}
    execution_instructions TEXT NOT NULL, -- Precise legally-required steps for signing
    legal_guidance JSONB NOT NULL DEFAULT '{}', -- Key legal rules, e.g., {"forced_heirship": true, "witnesses_required": 0}
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(country_code, language_code, version)
);

-- Create index for faster lookups
CREATE INDEX idx_will_templates_country_lang ON will_templates(country_code, language_code, is_active);

-- Create RLS policies
ALTER TABLE will_templates ENABLE ROW LEVEL SECURITY;

-- Policy for reading templates (authenticated users can read active templates)
CREATE POLICY "Users can read active will templates"
    ON will_templates
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy for admin users to manage templates
CREATE POLICY "Admin users can manage will templates"
    ON will_templates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_will_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_will_templates_updated_at
    BEFORE UPDATE ON will_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_will_templates_updated_at();

-- Insert initial templates for demonstration
INSERT INTO will_templates (
    country_code,
    language_code,
    template_name,
    template_body,
    execution_instructions,
    legal_guidance
) VALUES 
(
    'FR',
    'fr',
    'Testament Olographe Français',
    'Ceci est mon testament.

Je soussigné(e), {{full_name}}, né(e) le {{date_of_birth}} à {{place_of_birth}}, demeurant à {{current_address}}, sain(e) de corps et d''esprit, établis mes dernières volontés comme suit:

{{#if has_spouse}}
Je lègue à mon époux/épouse, {{spouse_name}}, {{spouse_inheritance}}.
{{/if}}

{{#each beneficiaries}}
Je lègue à {{this.name}}, {{this.relationship}}, {{this.inheritance_description}}.
{{/each}}

{{#if has_executor}}
Je nomme {{executor_name}} comme exécuteur testamentaire.
{{/if}}

Je révoque toutes dispositions testamentaires antérieures.

Fait à {{location}}, le {{date}}

{{signature_placeholder}}',
    'Ce testament doit être ENTIÈREMENT écrit à la main, daté et signé de votre main. Aucune partie ne peut être dactylographiée ou imprimée. Conservez l''original dans un lieu sûr et informez une personne de confiance de son emplacement.',
    '{
        "forced_heirship": true,
        "witnesses_required": 0,
        "notary_required": false,
        "handwritten_required": true,
        "minimum_age": 16,
        "notes": "En France, les enfants ont droit à une réserve héréditaire."
    }'
),
(
    'DE',
    'de',
    'Deutsches Eigenhändiges Testament',
    'Mein letzter Wille

Ich, {{full_name}}, geboren am {{date_of_birth}} in {{place_of_birth}}, wohnhaft in {{current_address}}, verfüge bei klarem Verstand folgendes:

{{#if has_spouse}}
Mein(e) Ehepartner(in) {{spouse_name}} soll {{spouse_inheritance}} erhalten.
{{/if}}

{{#each beneficiaries}}
{{this.name}} ({{this.relationship}}) soll {{this.inheritance_description}} erhalten.
{{/each}}

{{#if has_executor}}
Als Testamentsvollstrecker bestimme ich {{executor_name}}.
{{/if}}

Frühere Verfügungen widerrufe ich hiermit.

{{location}}, den {{date}}

{{signature_placeholder}}',
    'Dieses Testament muss VOLLSTÄNDIG handschriftlich verfasst, datiert und unterschrieben werden. Bewahren Sie das Original sicher auf.',
    '{
        "forced_heirship": true,
        "witnesses_required": 0,
        "notary_required": false,
        "handwritten_required": true,
        "minimum_age": 16,
        "pflichtteil": true,
        "notes": "Kinder und Ehepartner haben Anspruch auf den Pflichtteil."
    }'
),
(
    'GB-ENG',
    'en',
    'English Will Template',
    'LAST WILL AND TESTAMENT

I, {{full_name}}, of {{current_address}}, being of sound mind and body, hereby revoke all former wills and codicils made by me and declare this to be my Last Will and Testament.

1. EXECUTOR
I appoint {{executor_name}} of {{executor_address}} to be the Executor of this Will.

2. BENEFICIARIES
{{#each beneficiaries}}
I give {{this.inheritance_description}} to {{this.name}} of {{this.address}}.
{{/each}}

3. RESIDUE
I give the residue of my estate to {{residuary_beneficiary}}.

4. FUNERAL WISHES
{{funeral_wishes}}

IN WITNESS WHEREOF I have hereunto set my hand this {{date}}.

SIGNED by the Testator: _______________________

WITNESSED BY:
Witness 1: {{witness1_placeholder}}
Witness 2: {{witness2_placeholder}}',
    'This will must be signed in the presence of TWO witnesses who must both be present at the same time. The witnesses must also sign in your presence and in each other''s presence. Witnesses cannot be beneficiaries or their spouses.',
    '{
        "forced_heirship": false,
        "witnesses_required": 2,
        "notary_required": false,
        "handwritten_required": false,
        "minimum_age": 18,
        "notes": "English law allows testamentary freedom - you can leave your assets to anyone."
    }'
);

-- Create will_template_audit table for tracking changes
CREATE TABLE IF NOT EXISTS will_template_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES will_templates(id),
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    old_values JSONB,
    new_values JSONB
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_will_template_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO will_template_audit (template_id, action, changed_by, new_values)
        VALUES (NEW.id, 'CREATE', NEW.created_by, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO will_template_audit (template_id, action, changed_by, old_values, new_values)
        VALUES (NEW.id, 'UPDATE', NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO will_template_audit (template_id, action, changed_by, old_values)
        VALUES (OLD.id, 'DELETE', auth.uid(), to_jsonb(OLD));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger
CREATE TRIGGER will_template_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON will_templates
    FOR EACH ROW
    EXECUTE FUNCTION audit_will_template_changes();
