-- Create private bucket 'asset-attachments'
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-attachments', 'asset-attachments', false)
ON CONFLICT (id) DO NOTHING; -- Ignore if bucket already exists

-- Optional (recommended): add security policies
-- NOTE: Our backend uses service_role key, which bypasses RLS. Define stricter policies later as needed.
-- Example placeholders (commented out):
-- CREATE POLICY "authenticated can access their files" ON storage.objects
--   FOR SELECT USING (auth.role() = 'authenticated');


