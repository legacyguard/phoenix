-- Create beneficiary_communications table for tracking executor communications
CREATE TABLE IF NOT EXISTS beneficiary_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deceased_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    beneficiary_name TEXT NOT NULL,
    beneficiary_email TEXT,
    communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'phone', 'letter', 'in_person', 'other')),
    subject TEXT NOT NULL,
    summary TEXT NOT NULL,
    communication_date TIMESTAMPTZ NOT NULL,
    attachments TEXT[], -- Array of document IDs if any documents were shared
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create executor_status table for high-level status updates
CREATE TABLE IF NOT EXISTS executor_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deceased_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN (
        'initial_review',
        'gathering_documents',
        'probate_initiated',
        'assets_being_valued',
        'debts_being_settled',
        'tax_preparation',
        'ready_for_distribution',
        'distribution_in_progress',
        'estate_closed'
    )),
    status_description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_beneficiary_communications_executor ON beneficiary_communications(executor_id);
CREATE INDEX idx_beneficiary_communications_deceased ON beneficiary_communications(deceased_user_id);
CREATE INDEX idx_beneficiary_communications_date ON beneficiary_communications(communication_date DESC);
CREATE INDEX idx_executor_status_executor ON executor_status(executor_id);
CREATE INDEX idx_executor_status_deceased ON executor_status(deceased_user_id);

-- Enable Row Level Security
ALTER TABLE beneficiary_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE executor_status ENABLE ROW LEVEL SECURITY;

-- Policies for beneficiary_communications
CREATE POLICY "Executors can manage their communications" ON beneficiary_communications
    FOR ALL USING (auth.uid() = executor_id);

CREATE POLICY "Authorized family members can view communications" ON beneficiary_communications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trusted_people tp
            WHERE tp.trusted_person_id = auth.uid()
            AND tp.user_id = deceased_user_id
            AND tp.access_level IN ('full', 'read_only')
        )
    );

-- Policies for executor_status
CREATE POLICY "Executors can update status" ON executor_status
    FOR ALL USING (auth.uid() = executor_id);

CREATE POLICY "Family members can view executor status" ON executor_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trusted_people tp
            WHERE tp.trusted_person_id = auth.uid()
            AND tp.user_id = deceased_user_id
        )
        OR auth.uid() = executor_id
    );

-- Function to get the latest executor status
CREATE OR REPLACE FUNCTION get_latest_executor_status(p_deceased_user_id UUID)
RETURNS TABLE (
    status TEXT,
    status_description TEXT,
    updated_at TIMESTAMPTZ,
    executor_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        es.status,
        es.status_description,
        es.updated_at,
        p.full_name as executor_name
    FROM executor_status es
    JOIN profiles p ON p.id = es.executor_id
    WHERE es.deceased_user_id = p_deceased_user_id
    ORDER BY es.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE beneficiary_communications IS 'Tracks all communications between executors and beneficiaries';
COMMENT ON TABLE executor_status IS 'Tracks high-level estate administration status updates';
COMMENT ON COLUMN beneficiary_communications.attachments IS 'Array of document IDs that were shared in this communication';
COMMENT ON COLUMN executor_status.status IS 'Current high-level status of the estate administration process';
