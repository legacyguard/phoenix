/**
 * Document Store - Zustand store for managing document state
 * Centralizes all document-related state management
 */

import { create } from 'zustand';
import { documentService } from '@/services/documentService';
import { Document, DocumentFormData, DocumentCategory, DocumentStatus } from '@/types/documents';

interface DocumentStoreState {
  // State
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  selectedDocument: Document | null;
  
  // Actions
  fetchDocuments: () => Promise<void>;
  addDocument: (newDocument: DocumentFormData, file?: File) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>, newFile?: File) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  selectDocument: (document: Document | null) => void;
  clearError: () => void;
  
  // Computed values
  getDocumentById: (id: string) => Document | null;
  getDocumentsByCategory: (category: DocumentCategory) => Document[];
  getExpiringDocuments: () => Document[];
  getExpiredDocuments: () => Document[];
  searchDocuments: (query: string) => Document[];
  getDocumentsByPerson: (personId: string) => Document[];
  getDocumentsByStatus: (status: DocumentStatus) => Document[];
}

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  // Initial state
  documents: [],
  isLoading: false,
  error: null,
  selectedDocument: null,

  // Actions
  fetchDocuments: async () => {
    try {
      set({ isLoading: true, error: null });
      const documents = await documentService.getDocuments();
      set({ documents, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
        isLoading: false 
      });
    }
  },

  addDocument: async (newDocumentData: DocumentFormData, file?: File) => {
    try {
      set({ isLoading: true, error: null });
      const createdDocument = await documentService.createDocument(newDocumentData, file);
      set((state) => ({ 
        documents: [...state.documents, createdDocument],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add document',
        isLoading: false 
      });
    }
  },

  updateDocument: async (id: string, updates: Partial<Document>, newFile?: File) => {
    try {
      set({ isLoading: true, error: null });
      const updatedDocument = await documentService.updateDocument(id, updates, newFile);
      
      if (updatedDocument) {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? updatedDocument : doc
          ),
          selectedDocument: state.selectedDocument?.id === id ? updatedDocument : state.selectedDocument,
          isLoading: false
        }));
      } else {
        set({ 
          error: 'Document not found',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update document',
        isLoading: false 
      });
    }
  },

  deleteDocument: async (documentId: string) => {
    try {
      set({ isLoading: true, error: null });
      const success = await documentService.deleteDocument(documentId);
      
      if (success) {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== documentId),
          selectedDocument: state.selectedDocument?.id === documentId ? null : state.selectedDocument,
          isLoading: false
        }));
      } else {
        set({ 
          error: 'Document not found',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete document',
        isLoading: false 
      });
    }
  },

  selectDocument: (document: Document | null) => {
    set({ selectedDocument: document });
  },

  clearError: () => {
    set({ error: null });
  },

  // Computed values (getters)
  getDocumentById: (id: string) => {
    const { documents } = get();
    return documents.find(doc => doc.id === id) || null;
  },

  getDocumentsByCategory: (category: DocumentCategory) => {
    const { documents } = get();
    return documents.filter(doc => doc.category === category);
  },

  getExpiringDocuments: () => {
    const { documents } = get();
    const today = new Date();
    const ninetyDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    return documents.filter(doc => {
      if (!doc.expiryDate) return false;
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
    });
  },

  getExpiredDocuments: () => {
    const { documents } = get();
    const today = new Date();
    
    return documents.filter(doc => {
      if (!doc.expiryDate) return false;
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate < today;
    });
  },

  searchDocuments: (query: string) => {
    const { documents } = get();
    const lowerQuery = query.toLowerCase();
    
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.documentNumber?.toLowerCase().includes(lowerQuery) ||
      doc.issuingAuthority?.toLowerCase().includes(lowerQuery) ||
      doc.notes?.toLowerCase().includes(lowerQuery) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  getDocumentsByPerson: (personId: string) => {
    const { documents } = get();
    return documents.filter(doc => 
      doc.assignedPeople?.includes(personId)
    );
  },

  getDocumentsByStatus: (status: DocumentStatus) => {
    const { documents } = get();
    return documents.filter(doc => doc.status === status);
  },
}));

// Export selectors for better performance
export const useDocuments = () => useDocumentStore((state) => state.documents);
export const useDocumentLoading = () => useDocumentStore((state) => state.isLoading);
export const useDocumentError = () => useDocumentStore((state) => state.error);
export const useSelectedDocument = () => useDocumentStore((state) => state.selectedDocument);
