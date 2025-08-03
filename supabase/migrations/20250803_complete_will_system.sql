-- Complete Will System Database Schema

-- Create signed_documents table if not exists
CREATE TABLE IF NOT EXISTS signed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  signer_name TEXT NOT NULL,
  type TEXT CHECK (type IN ('will', 'power_of_attorney', 'advance_directive', 'other')),
  svg_stamp TEXT,
  signature_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create signature_requests table for e-signature tracking
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  signer_email TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  envelope_id TEXT,
  skribble_request_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'signed', 'completed', 'declined', 'qes_signed')),
  signature_level TEXT CHECK (signature_level IN ('SES', 'AES', 'QES')),
  signature_data JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create will_versions table for version control
CREATE TABLE IF NOT EXISTS will_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_reason TEXT,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to generated_wills if they don't exist
ALTER TABLE generated_wills 
ADD COLUMN IF NOT EXISTS requirements JSONB,
ADD COLUMN IF NOT EXISTS pdf_content TEXT,
ADD COLUMN IF NOT EXISTS signature_data TEXT,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qes_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signature_certificate TEXT,
ADD COLUMN IF NOT EXISTS notarized_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notary_details JSONB;

-- Create will_notarization table
CREATE TABLE IF NOT EXISTS will_notarization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  notary_name TEXT NOT NULL,
  notary_license TEXT NOT NULL,
  notary_jurisdiction TEXT NOT NULL,
  notarization_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notarization_location TEXT,
  notarization_certificate TEXT,
  verification_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create will_witnesses table
CREATE TABLE IF NOT EXISTS will_witnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  witness_name TEXT NOT NULL,
  witness_address TEXT,
  witness_signature TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function for will version tracking
CREATE OR REPLACE FUNCTION create_will_version(
  p_will_id UUID,
  p_content JSONB,
  p_created_by TEXT,
  p_created_reason TEXT,
  p_changes JSONB
) RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM will_versions
  WHERE will_id = p_will_id;
  
  -- Insert the new version
  INSERT INTO will_versions (will_id, version_number, content, created_by, created_reason, changes)
  VALUES (p_will_id, v_version_number, p_content, p_created_by, p_created_reason, p_changes)
  RETURNING id INTO v_version_id;
  
  -- Update the will version number
  UPDATE generated_wills
  SET version = v_version_number,
      updated_at = NOW()
  WHERE id = p_will_id;
  
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signed_documents_will_id ON signed_documents(will_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_user_id ON signed_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_will_id ON signature_requests(will_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON signature_requests(status);
CREATE INDEX IF NOT EXISTS idx_will_versions_will_id ON will_versions(will_id);
CREATE INDEX IF NOT EXISTS idx_will_notarization_will_id ON will_notarization(will_id);
CREATE INDEX IF NOT EXISTS idx_will_witnesses_will_id ON will_witnesses(will_id);

-- Enable RLS on new tables
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_notarization ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_witnesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signed_documents
CREATE POLICY "Users can view their own signed documents" ON signed_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signed documents" ON signed_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for signature_requests
CREATE POLICY "Users can view signature requests for their wills" ON signature_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = signature_requests.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );

-- RLS Policies for will_versions
CREATE POLICY "Users can view versions of their wills" ON will_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = will_versions.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );

-- RLS Policies for will_notarization
CREATE POLICY "Users can view notarization of their wills" ON will_notarization
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = will_notarization.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );

-- RLS Policies for will_witnesses
CREATE POLICY "Users can view witnesses of their wills" ON will_witnesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = will_witnesses.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );
