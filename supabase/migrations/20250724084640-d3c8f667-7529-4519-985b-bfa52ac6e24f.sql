-- Add is_key_document field to documents table
ALTER TABLE public.documents 
ADD COLUMN is_key_document BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.documents.is_key_document IS 'Whether this document should appear in the Survivors Manual as a key document';