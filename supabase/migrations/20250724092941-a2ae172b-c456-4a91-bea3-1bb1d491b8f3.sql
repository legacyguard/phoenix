-- Add invitation fields to guardians table
ALTER TABLE public.guardians 
ADD COLUMN invitation_status text DEFAULT 'not_sent' CHECK (invitation_status IN ('not_sent', 'sent', 'accepted', 'declined')),
ADD COLUMN invitation_email text,
ADD COLUMN invitation_token text UNIQUE,
ADD COLUMN invited_at timestamp with time zone,
ADD COLUMN accepted_at timestamp with time zone;