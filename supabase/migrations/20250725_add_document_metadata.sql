-- Add metadata fields to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS renewal_date DATE,
ADD COLUMN IF NOT EXISTS renewal_action TEXT,
ADD COLUMN IF NOT EXISTS importance_level TEXT DEFAULT 'reference' CHECK (importance_level IN ('critical', 'important', 'reference')),
ADD COLUMN IF NOT EXISTS related_assets UUID[] DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN public.documents.contract_number IS 'Contract or policy number for the document';
COMMENT ON COLUMN public.documents.contact_person IS 'Name of the contact person for this document';
COMMENT ON COLUMN public.documents.contact_phone IS 'Phone number of the contact person';
COMMENT ON COLUMN public.documents.contact_email IS 'Email address of the contact person';
COMMENT ON COLUMN public.documents.renewal_date IS 'Date when this document needs renewal';
COMMENT ON COLUMN public.documents.renewal_action IS 'Action to take for renewal (e.g., Contact agent 30 days before)';
COMMENT ON COLUMN public.documents.importance_level IS 'Importance level: critical, important, or reference';
COMMENT ON COLUMN public.documents.related_assets IS 'Array of asset IDs related to this document';

-- Create index for importance level for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_importance_level ON public.documents(importance_level);

-- Create index for renewal date for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_renewal_date ON public.documents(renewal_date);
