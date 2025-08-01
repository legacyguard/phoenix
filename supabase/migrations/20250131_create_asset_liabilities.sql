-- Create asset_liabilities table
CREATE TABLE IF NOT EXISTS public.asset_liabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    liability_type TEXT NOT NULL CHECK (liability_type IN (
        'Insurance Policy',
        'Utility Bill',
        'Property Tax',
        'Subscription Fee',
        'Maintenance Contract',
        'Loan',
        'Lease Agreement',
        'Warranty',
        'Other'
    )),
    provider_name TEXT NOT NULL,
    reference_number TEXT,
    payment_frequency TEXT NOT NULL CHECK (payment_frequency IN (
        'Monthly',
        'Quarterly',
        'Semi-Annually',
        'Annually',
        'One-Time',
        'As-Needed'
    )),
    amount DECIMAL(10, 2),
    next_payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_asset_liabilities_asset_id ON public.asset_liabilities(asset_id);
CREATE INDEX idx_asset_liabilities_user_id ON public.asset_liabilities(user_id);
CREATE INDEX idx_asset_liabilities_liability_type ON public.asset_liabilities(liability_type);

-- Enable RLS
ALTER TABLE public.asset_liabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own asset liabilities"
    ON public.asset_liabilities
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own asset liabilities"
    ON public.asset_liabilities
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asset liabilities"
    ON public.asset_liabilities
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own asset liabilities"
    ON public.asset_liabilities
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_asset_liabilities_updated_at
    BEFORE UPDATE ON public.asset_liabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert example data for demo purposes (optional)
-- These will only be visible to their respective users
/*
INSERT INTO public.asset_liabilities (asset_id, liability_type, provider_name, reference_number, payment_frequency, amount, notes, user_id)
VALUES 
    ('asset-id-1', 'Insurance Policy', 'Allianz Insurance', 'POL-2024-12345', 'Annually', 1200.00, 'Home insurance policy', 'user-id-1'),
    ('asset-id-2', 'Property Tax', 'City of Prague', 'TAX-2024-67890', 'Annually', 3500.00, 'Annual property tax', 'user-id-1'),
    ('asset-id-3', 'Utility Bill', 'ZSE Energia', 'UTIL-2024-11111', 'Monthly', 150.00, 'Electricity bill', 'user-id-1');
*/
