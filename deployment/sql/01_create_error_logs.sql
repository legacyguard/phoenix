-- Create error_logs table for application error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_level TEXT NOT NULL CHECK (error_level IN ('error', 'warning', 'critical')),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    error_context JSONB DEFAULT '{}',
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    browser_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_error_level ON public.error_logs(error_level);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_unresolved ON public.error_logs(created_at DESC) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage all error logs"
    ON public.error_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can insert their own errors
CREATE POLICY "Users can insert their own error logs"
    ON public.error_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admin users can view all error logs
CREATE POLICY "Admins can view all error logs"
    ON public.error_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create a view for error statistics
CREATE OR REPLACE VIEW public.error_statistics AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    error_level,
    COUNT(*) as error_count,
    COUNT(DISTINCT user_id) as affected_users,
    COUNT(DISTINCT page_url) as affected_pages
FROM public.error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), error_level
ORDER BY hour DESC;

-- Create a function to check for critical error threshold
CREATE OR REPLACE FUNCTION public.check_critical_error_threshold()
RETURNS TABLE(should_alert BOOLEAN, error_count INTEGER, time_window INTERVAL)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    threshold INTEGER;
    recent_errors INTEGER;
    window INTERVAL := INTERVAL '1 hour';
BEGIN
    -- Get threshold from environment or use default
    threshold := COALESCE(
        current_setting('app.critical_error_threshold', true)::INTEGER,
        5
    );
    
    -- Count critical errors in the last hour
    SELECT COUNT(*) INTO recent_errors
    FROM public.error_logs
    WHERE error_level = 'critical'
    AND created_at > NOW() - window
    AND resolved_at IS NULL;
    
    RETURN QUERY
    SELECT 
        recent_errors >= threshold,
        recent_errors,
        window;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_critical_error_threshold() TO authenticated;

-- Create a function to log errors
CREATE OR REPLACE FUNCTION public.log_error(
    p_error_level TEXT,
    p_error_message TEXT,
    p_error_stack TEXT DEFAULT NULL,
    p_error_context JSONB DEFAULT '{}',
    p_page_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_browser_info JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_error_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current user ID if authenticated
    v_user_id := auth.uid();
    
    -- Insert error log
    INSERT INTO public.error_logs (
        user_id,
        error_level,
        error_message,
        error_stack,
        error_context,
        page_url,
        user_agent,
        browser_info
    ) VALUES (
        v_user_id,
        p_error_level,
        p_error_message,
        p_error_stack,
        p_error_context,
        p_page_url,
        p_user_agent,
        p_browser_info
    ) RETURNING id INTO v_error_id;
    
    RETURN v_error_id;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.log_error TO anon, authenticated;
