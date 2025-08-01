-- Create guardian_playbooks table
CREATE TABLE public.guardian_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  guardian_id UUID NOT NULL,
  funeral_wishes TEXT,
  digital_accounts_shutdown TEXT,
  important_contacts JSONB DEFAULT '[]'::jsonb,
  document_locations TEXT,
  personal_messages TEXT,
  practical_instructions TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('empty', 'draft', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_guardian FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE CASCADE,
  
  -- Ensure one playbook per guardian
  CONSTRAINT unique_guardian_playbook UNIQUE (guardian_id)
);

-- Enable Row Level Security
ALTER TABLE public.guardian_playbooks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own playbooks" 
ON public.guardian_playbooks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playbooks" 
ON public.guardian_playbooks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playbooks" 
ON public.guardian_playbooks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playbooks" 
ON public.guardian_playbooks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy for guardians to view playbooks assigned to them
CREATE POLICY "Guardians can view assigned playbooks"
ON public.guardian_playbooks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guardians g
    WHERE g.id = guardian_playbooks.guardian_id
    AND g.invitation_status = 'accepted'
    AND g.invitation_email = auth.jwt()->>'email'
  )
);

-- Create indexes for performance
CREATE INDEX idx_guardian_playbooks_user_id ON public.guardian_playbooks(user_id);
CREATE INDEX idx_guardian_playbooks_guardian_id ON public.guardian_playbooks(guardian_id);
CREATE INDEX idx_guardian_playbooks_status ON public.guardian_playbooks(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_guardian_playbooks_updated_at
BEFORE UPDATE ON public.guardian_playbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for clarity
COMMENT ON TABLE public.guardian_playbooks IS 'Stores personalized instructions and information for each guardian';
COMMENT ON COLUMN public.guardian_playbooks.funeral_wishes IS 'User''s funeral and memorial service preferences';
COMMENT ON COLUMN public.guardian_playbooks.digital_accounts_shutdown IS 'Instructions for handling digital accounts and online presence';
COMMENT ON COLUMN public.guardian_playbooks.important_contacts IS 'JSON array of important contacts specific to this guardian';
COMMENT ON COLUMN public.guardian_playbooks.document_locations IS 'Information about where to find important documents';
COMMENT ON COLUMN public.guardian_playbooks.personal_messages IS 'Personal messages for the guardian';
COMMENT ON COLUMN public.guardian_playbooks.practical_instructions IS 'Practical instructions for immediate actions';
COMMENT ON COLUMN public.guardian_playbooks.status IS 'Playbook status: empty, draft, or complete';
