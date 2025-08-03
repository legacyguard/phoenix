-- ========================================
-- Storage Bucket Policies Setup
-- ========================================
-- Run this after the main database setup

-- 1. Documents Bucket Policies
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Time Capsules Bucket Policies
-- Allow authenticated users to upload their own time capsule media
CREATE POLICY "Users can upload own time capsule media" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'time-capsules' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own time capsule media
CREATE POLICY "Users can view own time capsule media" ON storage.objects
FOR SELECT USING (
    bucket_id = 'time-capsules' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own time capsule media
CREATE POLICY "Users can update own time capsule media" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'time-capsules' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own time capsule media
CREATE POLICY "Users can delete own time capsule media" ON storage.objects
FOR DELETE USING (
    bucket_id = 'time-capsules' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Will Documents Bucket Policies
-- Allow authenticated users to upload their own will documents
CREATE POLICY "Users can upload own will documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'will-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own will documents
CREATE POLICY "Users can view own will documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'will-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own will documents
CREATE POLICY "Users can update own will documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'will-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own will documents
CREATE POLICY "Users can delete own will documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'will-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify storage policies were created
SELECT 
    bucket_id,
    name as policy_name,
    definition
FROM storage.policies
WHERE bucket_id IN ('documents', 'time-capsules', 'will-documents')
ORDER BY bucket_id, name;
