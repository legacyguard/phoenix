-- Will Requirements table for country-specific legal requirements
CREATE TABLE will_requirements (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL UNIQUE,
  country_name VARCHAR(100) NOT NULL,
  witness_count INTEGER DEFAULT 2,
  requires_handwriting BOOLEAN DEFAULT false,
  requires_notarization BOOLEAN DEFAULT false,
  required_clauses JSONB NOT NULL DEFAULT '[]'::jsonb,
  forbidden_content TEXT[] DEFAULT ARRAY[]::TEXT[],
  legal_language JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Wills table
CREATE TABLE generated_wills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,
  will_content JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'completed', 'revoked')),
  version INTEGER DEFAULT 1,
  pdf_url TEXT,
  handwriting_template_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (country_code) REFERENCES will_requirements(country_code)
);

-- Will Signatures table
CREATE TABLE will_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  signatory_type VARCHAR(20) NOT NULL CHECK (signatory_type IN ('testator', 'witness', 'notary')),
  signatory_name VARCHAR(255) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data for Slovakia and Czech Republic
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'SK',
  'Slovakia',
  2,
  false,
  false,
  '["identity", "revocation", "beneficiaries", "date", "signature"]'::jsonb,
  '{
    "title": "Závet",
    "identity": "Ja, dolupodpísaný/á {name}, narodený/á {birthDate}, bytom {address}",
    "revocation": "Týmto odvolávam všetky svoje predchádzajúce závety a dodatkové doložky.",
    "beneficiaries": "Odkazujem",
    "signature": "Podpis závetcu",
    "witness": "Svedok",
    "date": "Dátum"
  }'::jsonb,
  'Requires either handwriting by testator OR typed with 2 witnesses present at signing'
),
(
  'CZ',
  'Czech Republic',
  2,
  false,
  true,
  '["identity", "revocation", "beneficiaries", "date", "signature", "soundMind"]'::jsonb,
  '{
    "title": "Závěť",
    "identity": "Já, níže podepsaný/á {name}, narozen/a {birthDate}, bytem {address}",
    "revocation": "Tímto odvolávám všechny své předchozí závěti a kodexy.",
    "beneficiaries": "Odkazuji",
    "signature": "Podpis zůstavitele",
    "witness": "Svědek",
    "date": "Datum",
    "soundMind": "prohlašuji, že jsem při plném vědomí a způsobilý/á k právním úkonům"
  }'::jsonb,
  'Requires either handwriting by testator OR typed with 2 witnesses and notarization'
);

-- Indexes
CREATE INDEX idx_generated_wills_user_id ON generated_wills(user_id);
CREATE INDEX idx_generated_wills_status ON generated_wills(status);
CREATE INDEX idx_will_signatures_will_id ON will_signatures(will_id);

-- RLS Policies
ALTER TABLE generated_wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_signatures ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wills
CREATE POLICY "Users can view own wills" ON generated_wills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wills" ON generated_wills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft wills" ON generated_wills
  FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

-- Users can view signatures for their wills
CREATE POLICY "Users can view signatures for own wills" ON will_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = will_signatures.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );
