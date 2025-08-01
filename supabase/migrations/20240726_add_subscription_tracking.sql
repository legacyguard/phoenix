-- Add subscription tracking fields to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS subscription_type text CHECK (subscription_type IN ('monthly', 'yearly', 'one-time', 'none')),
ADD COLUMN IF NOT EXISTS renewal_cost decimal(10,2),
ADD COLUMN IF NOT EXISTS auto_renewal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS provider_contact_info jsonb,
ADD COLUMN IF NOT EXISTS cancellation_notice_period integer CHECK (cancellation_notice_period IN (0, 30, 60, 90)),
ADD COLUMN IF NOT EXISTS last_renewal_date date,
ADD COLUMN IF NOT EXISTS next_review_date date;

-- Add comments for clarity
COMMENT ON COLUMN documents.subscription_type IS 'Type of subscription for this document';
COMMENT ON COLUMN documents.renewal_cost IS 'Cost of renewal in user''s preferred currency';
COMMENT ON COLUMN documents.auto_renewal IS 'Whether this subscription auto-renews';
COMMENT ON COLUMN documents.provider_contact_info IS 'JSON object with phone, email, website';
COMMENT ON COLUMN documents.cancellation_notice_period IS 'Days notice required for cancellation';
COMMENT ON COLUMN documents.last_renewal_date IS 'Date of last renewal/payment';
COMMENT ON COLUMN documents.next_review_date IS 'Suggested date to review this subscription';

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_documents_subscription_type ON documents(subscription_type) WHERE subscription_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_renewal_date ON documents(renewal_date) WHERE renewal_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_next_review_date ON documents(next_review_date) WHERE next_review_date IS NOT NULL;

-- Create subscription costs view
CREATE OR REPLACE VIEW subscription_costs AS
SELECT 
    user_id,
    subscription_type,
    SUM(renewal_cost) as total_cost,
    COUNT(*) as subscription_count,
    SUM(CASE WHEN auto_renewal = true THEN renewal_cost ELSE 0 END) as auto_renewal_cost,
    SUM(CASE WHEN subscription_type = 'monthly' THEN renewal_cost * 12 
             WHEN subscription_type = 'yearly' THEN renewal_cost 
             ELSE 0 END) as annual_cost
FROM documents
WHERE subscription_type IS NOT NULL 
    AND subscription_type != 'none' 
    AND subscription_type != 'one-time'
    AND renewal_cost IS NOT NULL
GROUP BY user_id, subscription_type;

-- Create function to calculate upcoming renewals
CREATE OR REPLACE FUNCTION get_upcoming_renewals(
    p_user_id uuid,
    p_days_ahead integer DEFAULT 90
)
RETURNS TABLE (
    document_id uuid,
    name text,
    document_type text,
    subscription_type text,
    renewal_date date,
    renewal_cost decimal,
    auto_renewal boolean,
    provider_contact_info jsonb,
    days_until_renewal integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.document_type,
        d.subscription_type,
        d.renewal_date,
        d.renewal_cost,
        d.auto_renewal,
        d.provider_contact_info,
        (d.renewal_date - CURRENT_DATE)::integer as days_until_renewal
    FROM documents d
    WHERE d.user_id = p_user_id
        AND d.renewal_date IS NOT NULL
        AND d.renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '1 day' * p_days_ahead
        AND (d.subscription_type IS NULL OR d.subscription_type != 'none')
    ORDER BY d.renewal_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to suggest review dates
CREATE OR REPLACE FUNCTION suggest_review_date(
    p_document_type text,
    p_subscription_type text,
    p_last_review_date date DEFAULT NULL
)
RETURNS date AS $$
DECLARE
    v_interval interval;
BEGIN
    -- Determine review interval based on document and subscription type
    CASE 
        WHEN p_subscription_type = 'monthly' THEN
            v_interval := interval '6 months';
        WHEN p_subscription_type = 'yearly' THEN
            v_interval := interval '11 months';
        WHEN p_document_type IN ('insurance_policy', 'energy_contract') THEN
            v_interval := interval '11 months';
        WHEN p_document_type IN ('bank_statement', 'investment_report') THEN
            v_interval := interval '12 months';
        WHEN p_document_type = 'software_license' THEN
            v_interval := interval '6 months';
        ELSE
            v_interval := interval '12 months';
    END CASE;
    
    -- Calculate next review date
    IF p_last_review_date IS NOT NULL THEN
        RETURN p_last_review_date + v_interval;
    ELSE
        RETURN CURRENT_DATE + v_interval;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create subscription preferences table
CREATE TABLE IF NOT EXISTS subscription_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tracking_enabled boolean DEFAULT true,
    tracked_document_types text[] DEFAULT ARRAY['insurance_policy', 'energy_contract', 'software_license', 'subscription_service'],
    default_reminder_days integer[] DEFAULT ARRAY[90, 60, 30, 7],
    cost_optimization_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Add RLS policies for subscription preferences
ALTER TABLE subscription_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription preferences" ON subscription_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription preferences" ON subscription_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription preferences" ON subscription_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to get cost optimization suggestions
CREATE OR REPLACE FUNCTION get_cost_optimization_suggestions(
    p_user_id uuid,
    p_threshold_percentage decimal DEFAULT 10
)
RETURNS TABLE (
    document_id uuid,
    name text,
    document_type text,
    current_cost decimal,
    previous_cost decimal,
    cost_increase decimal,
    percentage_increase decimal,
    suggestion text
) AS $$
BEGIN
    RETURN QUERY
    WITH cost_history AS (
        SELECT 
            d.id,
            d.name,
            d.document_type,
            d.renewal_cost as current_cost,
            LAG(d.renewal_cost) OVER (PARTITION BY d.name ORDER BY d.updated_at) as previous_cost
        FROM documents d
        WHERE d.user_id = p_user_id
            AND d.renewal_cost IS NOT NULL
    )
    SELECT 
        ch.id,
        ch.name,
        ch.document_type,
        ch.current_cost,
        ch.previous_cost,
        (ch.current_cost - ch.previous_cost) as cost_increase,
        ((ch.current_cost - ch.previous_cost) / ch.previous_cost * 100)::decimal(5,2) as percentage_increase,
        CASE 
            WHEN (ch.current_cost - ch.previous_cost) / ch.previous_cost * 100 > p_threshold_percentage THEN
                'Consider reviewing this subscription - cost increased by ' || 
                ((ch.current_cost - ch.previous_cost) / ch.previous_cost * 100)::decimal(5,2)::text || '%'
            WHEN ch.document_type = 'insurance_policy' AND ch.current_cost > 1000 THEN
                'High-value insurance - consider shopping for better rates'
            WHEN ch.document_type = 'energy_contract' THEN
                'Review energy usage and compare providers'
            ELSE
                'Regular review recommended'
        END as suggestion
    FROM cost_history ch
    WHERE ch.previous_cost IS NOT NULL
        AND ch.current_cost > ch.previous_cost
    ORDER BY (ch.current_cost - ch.previous_cost) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON subscription_costs TO authenticated;
GRANT SELECT ON subscription_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_renewals TO authenticated;
GRANT EXECUTE ON FUNCTION suggest_review_date TO authenticated;
GRANT EXECUTE ON FUNCTION get_cost_optimization_suggestions TO authenticated;
