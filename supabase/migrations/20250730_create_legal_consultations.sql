-- Create legal_consultations table for tracking consultation requests
CREATE TABLE IF NOT EXISTS legal_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_type VARCHAR(50) NOT NULL CHECK (consultation_type IN ('will_review', 'estate_planning_qa', 'executor_guidance', 'beneficiary_advice', 'trust_setup', 'tax_planning')),
    user_question TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'submitted_to_firm', 'in_review', 'answered', 'closed', 'cancelled')),
    law_firm_response TEXT,
    country_code VARCHAR(10) NOT NULL, -- To route to correct law firm (e.g., 'CZ', 'UK', 'US')
    assigned_firm_id UUID REFERENCES law_firms(id),
    assigned_lawyer_id UUID,
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    payment_amount DECIMAL(10, 2),
    payment_currency VARCHAR(3) DEFAULT 'EUR',
    paid_at TIMESTAMPTZ,
    submitted_to_firm_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX idx_legal_consultations_user_id ON legal_consultations(user_id);
CREATE INDEX idx_legal_consultations_status ON legal_consultations(status);
CREATE INDEX idx_legal_consultations_country ON legal_consultations(country_code);

-- Create law_firms table to manage partner law firms
CREATE TABLE IF NOT EXISTS law_firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    consultation_types TEXT[], -- Array of consultation types they handle
    pricing JSONB DEFAULT '{}'::jsonb, -- Pricing for different consultation types
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert example partner law firms
INSERT INTO law_firms (name, country_code, email, consultation_types, pricing) VALUES
('Novák & Partners Law Firm', 'CZ', 'consultations@novak-partners.cz', 
 ARRAY['will_review', 'estate_planning_qa', 'executor_guidance'], 
 '{"will_review": 99, "estate_planning_qa": 79, "executor_guidance": 129}'::jsonb),
('Smith & Associates', 'GB', 'legal@smith-associates.co.uk', 
 ARRAY['will_review', 'estate_planning_qa', 'trust_setup', 'tax_planning'], 
 '{"will_review": 89, "estate_planning_qa": 69, "trust_setup": 199, "tax_planning": 149}'::jsonb),
('Johnson Legal Services', 'US', 'consultations@johnsonlegal.com', 
 ARRAY['will_review', 'estate_planning_qa', 'executor_guidance', 'beneficiary_advice'], 
 '{"will_review": 99, "estate_planning_qa": 79, "executor_guidance": 149, "beneficiary_advice": 89}'::jsonb);

-- Create RLS policies
ALTER TABLE legal_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE law_firms ENABLE ROW LEVEL SECURITY;

-- Users can view their own consultations
CREATE POLICY "Users can view own consultations"
    ON legal_consultations
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create consultations
CREATE POLICY "Users can create consultations"
    ON legal_consultations
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own consultations (limited fields)
CREATE POLICY "Users can update own consultations"
    ON legal_consultations
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- All authenticated users can view active law firms
CREATE POLICY "Users can view active law firms"
    ON law_firms
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_legal_consultations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_legal_consultations_updated_at
    BEFORE UPDATE ON legal_consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_consultations_updated_at();

-- Create function to handle consultation status updates
CREATE OR REPLACE FUNCTION update_consultation_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update timestamp when status changes
    IF OLD.status = 'pending_payment' AND NEW.status = 'submitted_to_firm' THEN
        NEW.submitted_to_firm_at = NOW();
    ELSIF OLD.status != 'answered' AND NEW.status = 'answered' THEN
        NEW.responded_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status updates
CREATE TRIGGER consultation_status_timestamp
    BEFORE UPDATE ON legal_consultations
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_consultation_status_timestamp();

-- Create view for consultation statistics
CREATE OR REPLACE VIEW consultation_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_consultations,
    COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered_consultations,
    COUNT(CASE WHEN status = 'pending_payment' THEN 1 END) as pending_payment,
    COUNT(CASE WHEN status = 'submitted_to_firm' THEN 1 END) as awaiting_response,
    AVG(CASE 
        WHEN responded_at IS NOT NULL AND submitted_to_firm_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (responded_at - submitted_to_firm_at))/3600 
    END) as avg_response_time_hours
FROM legal_consultations
GROUP BY user_id;
