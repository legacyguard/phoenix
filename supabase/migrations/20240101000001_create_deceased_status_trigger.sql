-- Add status column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deceased', 'inactive'));

-- Add executor relationships table
CREATE TABLE IF NOT EXISTS public.executor_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    executor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary', 'secondary', 'emergency')),
    permissions JSONB DEFAULT '{"full_access": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, executor_id, relationship_type)
);

-- Create indexes
CREATE INDEX idx_executor_relationships_user ON public.executor_relationships(user_id);
CREATE INDEX idx_executor_relationships_executor ON public.executor_relationships(executor_id);

-- Add RLS policies
ALTER TABLE public.executor_relationships ENABLE ROW LEVEL SECURITY;

-- Users can view their own executor relationships
CREATE POLICY "Users can view own executors" ON public.executor_relationships
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage their own executor relationships
CREATE POLICY "Users can manage own executors" ON public.executor_relationships
    FOR ALL
    USING (auth.uid() = user_id);

-- Executors can view relationships where they are designated
CREATE POLICY "Executors can view their designations" ON public.executor_relationships
    FOR SELECT
    USING (auth.uid() = executor_id);

-- Create function to handle status change to deceased
CREATE OR REPLACE FUNCTION public.handle_user_deceased()
RETURNS TRIGGER AS $$
DECLARE
    executor_record RECORD;
BEGIN
    -- Check if status changed to deceased
    IF NEW.status = 'deceased' AND (OLD.status IS NULL OR OLD.status != 'deceased') THEN
        -- Find all executors for this user
        FOR executor_record IN 
            SELECT executor_id 
            FROM public.executor_relationships 
            WHERE user_id = NEW.id
            ORDER BY 
                CASE relationship_type 
                    WHEN 'primary' THEN 1 
                    WHEN 'secondary' THEN 2 
                    ELSE 3 
                END
        LOOP
            -- Call edge function to generate tasks (we'll implement this as a Supabase Edge Function)
            -- For now, we'll insert a notification record
            INSERT INTO public.notifications (
                user_id,
                type,
                title,
                message,
                metadata
            ) VALUES (
                executor_record.executor_id,
                'executor_activated',
                'You have been activated as an executor',
                'You have been designated as an executor. Please check your Executor Dashboard for important tasks.',
                jsonb_build_object(
                    'deceased_user_id', NEW.id,
                    'trigger_time', now()
                )
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status changes
CREATE TRIGGER on_user_deceased
    AFTER UPDATE OF status ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_deceased();

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- Add RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);
