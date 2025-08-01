import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Document {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: string;
  metadata: any;
  created_at: string;
  expiration_date?: string;
}

export function useDocuments() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete document');
      console.error('Delete document error:', error);
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast.success('Document updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update document');
      console.error('Update document error:', error);
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    deleteDocument: deleteDocument.mutate,
    updateDocument: updateDocument.mutate,
    isDeleting: deleteDocument.isLoading,
    isUpdating: updateDocument.isLoading,
  };
}
