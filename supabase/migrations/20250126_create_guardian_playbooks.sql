-- Create guardian_playbooks table
CREATE TABLE IF NOT EXISTS public.guardian_playbooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    funeral_wishes TEXT,
    digital_accounts_shutdown TEXT,
    important_contacts JSONB DEFAULT '[]'::JSONB,
    document_locations TEXT,
    personal_messages TEXT,
    practical_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, guardian_id)
);

-- Create indexes for performance
CREATE INDEX idx_guardian_playbooks_user_id ON public.guardian_playbooks(user_id);
CREATE INDEX idx_guardian_playbooks_guardian_id ON public.guardian_playbooks(guardian_id);

-- Create updated_at trigger
CREATE TRIGGER update_guardian_playbooks_updated_at 
    BEFORE UPDATE ON public.guardian_playbooks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.guardian_playbooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view and edit their own playbooks
CREATE POLICY "Users can view own playbooks" ON public.guardian_playbooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playbooks" ON public.guardian_playbooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks" ON public.guardian_playbooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks" ON public.guardian_playbooks
    FOR DELETE USING (auth.uid() = user_id);

-- Guardians can view playbooks they are assigned to
CREATE POLICY "Guardians can view assigned playbooks" ON public.guardian_playbooks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.guardians
            WHERE guardians.id = guardian_playbooks.guardian_id
            AND guardians.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND guardians.status = 'accepted'
        )
    );

-- Create function to get playbook status
CREATE OR REPLACE FUNCTION get_playbook_status(playbook_id UUID)
RETURNS TEXT AS $$
DECLARE
    playbook_record RECORD;
BEGIN
    SELECT * INTO playbook_record
    FROM public.guardian_playbooks
    WHERE id = playbook_id;
    
    IF NOT FOUND THEN
        RETURN 'empty';
    END IF;
    
    -- Check if all fields are filled
    IF playbook_record.funeral_wishes IS NOT NULL 
        AND playbook_record.digital_accounts_shutdown IS NOT NULL
        AND playbook_record.important_contacts IS NOT NULL
        AND jsonb_array_length(playbook_record.important_contacts) > 0
        AND playbook_record.document_locations IS NOT NULL
        AND playbook_record.personal_messages IS NOT NULL
        AND playbook_record.practical_instructions IS NOT NULL THEN
        RETURN 'complete';
    ELSE
        RETURN 'draft';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_playbook_status(UUID) TO authenticated;
