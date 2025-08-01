-- Create guardians table
CREATE TABLE public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  country_code TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own guardians" 
ON public.guardians 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own guardians" 
ON public.guardians 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guardians" 
ON public.guardians 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guardians" 
ON public.guardians 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_guardians_updated_at
BEFORE UPDATE ON public.guardians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();