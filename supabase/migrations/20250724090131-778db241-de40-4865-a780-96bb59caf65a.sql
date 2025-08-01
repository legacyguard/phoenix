-- Create wills table for TRANSFER pillar
CREATE TABLE public.wills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'Not Started',
  document_path TEXT,
  physical_location TEXT,
  executor_contact_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('Not Started', 'In Preparation', 'Completed & Signed', 'With Notary'))
);

-- Enable RLS
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own will" 
ON public.wills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own will" 
ON public.wills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own will" 
ON public.wills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own will" 
ON public.wills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_wills_updated_at
BEFORE UPDATE ON public.wills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create instructions table for Manual
CREATE TABLE public.instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  funeral_wishes TEXT,
  digital_accounts_shutdown TEXT,
  messages_to_loved_ones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own instructions" 
ON public.instructions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instructions" 
ON public.instructions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instructions" 
ON public.instructions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instructions" 
ON public.instructions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_instructions_updated_at
BEFORE UPDATE ON public.instructions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();