-- Migration script to add UK jurisdictions to the will_templates table

BEGIN;

-- Check and Insert new country codes with safety check for idempotency
DO $$
BEGIN
    -- England
    IF NOT EXISTS (SELECT 1 FROM will_templates WHERE country_code = 'GB-ENG') THEN
        INSERT INTO will_templates (country_code, language_code, template_name, template_body, execution_instructions, legal_guidance)
        VALUES ('GB-ENG', 'en', 'English Will Template', 'Placeholder for English language will text...', 'Instructions...', '{"witnesses_required": 2, "forced_heirship": false}');
    END IF;

    -- Wales
    IF NOT EXISTS (SELECT 1 FROM will_templates WHERE country_code = 'GB-WLS') THEN
        INSERT INTO will_templates (country_code, language_code, template_name, template_body, execution_instructions, legal_guidance)
        VALUES ('GB-WLS', 'en', 'Welsh Will in English', 'Placeholder for English text...', 'Instructions...', '{"witnesses_required": 2, "forced_heirship": true}'),
               ('GB-WLS', 'cy', 'Welsh Will (Testament Cymraeg)', 'Placeholder for Welsh text...', 'Instructions...', '{"witnesses_required": 2, "forced_heirship": true}');
    END IF;

    -- Scotland
    IF NOT EXISTS (SELECT 1 FROM will_templates WHERE country_code = 'GB-SCT') THEN
        INSERT INTO will_templates (country_code, language_code, template_name, template_body, execution_instructions, legal_guidance)
        VALUES ('GB-SCT', 'en', 'Scottish Will Template', 'Placeholder for Scottish text...', 'Instructions...', '{"witnesses_required": 2, "forced_heirship": false}');
    END IF;

    -- Northern Ireland
    IF NOT EXISTS (SELECT 1 FROM will_templates WHERE country_code = 'GB-NIR') THEN
        INSERT INTO will_templates (country_code, language_code, template_name, template_body, execution_instructions, legal_guidance)
        VALUES ('GB-NIR', 'en', 'Northern Irish Will Template', 'Placeholder for Northern Irish text...', 'Instructions...', '{"witnesses_required": 2, "forced_heirship": false}');
    END IF;
END $$;

COMMIT;

