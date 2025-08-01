-- Create executor_tasks table
CREATE TABLE IF NOT EXISTS public.executor_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deceased_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    executor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    category TEXT NOT NULL CHECK (category IN ('immediate', 'first_week', 'ongoing')),
    priority INTEGER DEFAULT 0,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    related_document_ids UUID[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_executor_tasks_deceased_user ON public.executor_tasks(deceased_user_id);
CREATE INDEX idx_executor_tasks_executor ON public.executor_tasks(executor_id);
CREATE INDEX idx_executor_tasks_status ON public.executor_tasks(status);
CREATE INDEX idx_executor_tasks_category ON public.executor_tasks(category);

-- Add RLS policies
ALTER TABLE public.executor_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Executors can view their assigned tasks
CREATE POLICY "Executors can view their tasks" ON public.executor_tasks
    FOR SELECT
    USING (auth.uid() = executor_id);

-- Policy: Executors can update their assigned tasks
CREATE POLICY "Executors can update their tasks" ON public.executor_tasks
    FOR UPDATE
    USING (auth.uid() = executor_id);

-- Policy: System can insert tasks (for backend service)
CREATE POLICY "System can insert tasks" ON public.executor_tasks
    FOR INSERT
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER executor_tasks_updated_at
    BEFORE UPDATE ON public.executor_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
