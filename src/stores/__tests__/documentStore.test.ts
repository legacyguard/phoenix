import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocumentStore, useDocuments } from '../documentStore';
import { documentService } from '@/services/documentService';
import { Document, DocumentFormData, DocumentCategory, DocumentStatus } from '@/types/documents';

// Mock documentService
vi.mock('@/services/documentService', () => ({
  documentService: {
    getDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    userId: 'user-1',
    name: 'Passport',
    category: 'personal',
    status: 'active',
    documentNumber: 'P123456789',
    issuingAuthority: 'Department of State',
    issueDate: '2020-01-15',
    expiryDate: '2030-01-15',
    notes: 'Primary identification document',
    tags: ['identification', 'travel'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'doc-2',
    userId: 'user-1',
    name: 'Insurance Policy',
    category: 'financial',
    status: 'active',
    documentNumber: 'INS-789456',
    issuingAuthority: 'State Farm Insurance',
    issueDate: '2023-06-01',
    expiryDate: '2024-06-01',
    notes: 'Auto insurance coverage',
    tags: ['insurance', 'auto'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('Document Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useDocumentStore.setState({
        documents: [],
        isLoading: false,
        error: null,
        selectedDocument: null,
      });
    });
    
    vi.clearAllMocks();
  });

  describe('useDocumentStore', () => {
    it('should have initial state', () => {
      const { result } = renderHook(() => useDocumentStore());
      
      expect(result.current.documents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedDocument).toBeNull();
    });

    it('should fetch documents successfully', async () => {
      const mockGetDocuments = vi.mocked(documentService.getDocuments);
      mockGetDocuments.mockResolvedValue(mockDocuments);

      const { result } = renderHook(() => useDocumentStore());

      await act(async () => {
        await result.current.fetchDocuments();
      });

      expect(result.current.documents).toEqual(mockDocuments);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetDocuments).toHaveBeenCalledOnce();
    });

    it('should handle fetch documents error', async () => {
      const mockGetDocuments = vi.mocked(documentService.getDocuments);
      mockGetDocuments.mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(() => useDocumentStore());

      await act(async () => {
        await result.current.fetchDocuments();
      });

      expect(result.current.documents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Fetch failed');
    });

    it('should add document successfully', async () => {
      const newDocumentData: DocumentFormData = {
        name: 'New Document',
        category: 'legal',
        notes: 'Test document',
      };

      const createdDocument: Document = {
        ...newDocumentData,
        id: 'doc-new',
        userId: 'user-1',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockCreateDocument = vi.mocked(documentService.createDocument);
      mockCreateDocument.mockResolvedValue(createdDocument);

      const { result } = renderHook(() => useDocumentStore());

      await act(async () => {
        await result.current.addDocument(newDocumentData);
      });

      expect(result.current.documents).toContain(createdDocument);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockCreateDocument).toHaveBeenCalledWith(newDocumentData, undefined);
    });

    it('should add document with file successfully', async () => {
      const newDocumentData: DocumentFormData = {
        name: 'New Document',
        category: 'legal',
        notes: 'Test document',
      };

      const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      const createdDocument: Document = {
        ...newDocumentData,
        id: 'doc-new',
        userId: 'user-1',
        status: 'active',
        file: {
          name: 'test.pdf',
          type: 'application/pdf',
          size: 12,
          uploadedAt: '2024-01-01T00:00:00Z',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockCreateDocument = vi.mocked(documentService.createDocument);
      mockCreateDocument.mockResolvedValue(createdDocument);

      const { result } = renderHook(() => useDocumentStore());

      await act(async () => {
        await result.current.addDocument(newDocumentData, testFile);
      });

      expect(result.current.documents).toContain(createdDocument);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockCreateDocument).toHaveBeenCalledWith(newDocumentData, testFile);
    });

    it('should update document successfully', async () => {
      // First, set up some documents
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const updates = { name: 'Updated Document Name' };
      const updatedDocument = { ...mockDocuments[0], ...updates, updatedAt: '2024-01-02T00:00:00Z' };

      const mockUpdateDocument = vi.mocked(documentService.updateDocument);
      mockUpdateDocument.mockResolvedValue(updatedDocument);

      const { result } = renderHook(() => useDocumentStore());

      await act(async () => {
        await result.current.updateDocument('doc-1', updates);
      });

      expect(result.current.documents[0].name).toBe('Updated Document Name');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockUpdateDocument).toHaveBeenCalledWith('doc-1', updates, undefined);
    });

    it('should delete document successfully', async () => {
      // First, set up some documents
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const mockDeleteDocument = vi.mocked(documentService.deleteDocument);
      mockDeleteDocument.mockResolvedValue(true);

      const { result } = renderHook(() => useDocumentStore());

      await act(async () => {
        await result.current.deleteDocument('doc-1');
      });

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0].id).toBe('doc-2');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockDeleteDocument).toHaveBeenCalledWith('doc-1');
    });

    it('should select document', () => {
      const { result } = renderHook(() => useDocumentStore());

      act(() => {
        result.current.selectDocument(mockDocuments[0]);
      });

      expect(result.current.selectedDocument).toEqual(mockDocuments[0]);
    });

    it('should clear error', () => {
      // First, set an error
      act(() => {
        useDocumentStore.setState({ error: 'Test error' });
      });

      const { result } = renderHook(() => useDocumentStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should get document by ID', () => {
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const { result } = renderHook(() => useDocumentStore());

      const document = result.current.getDocumentById('doc-1');
      expect(document).toEqual(mockDocuments[0]);

      const nonExistentDocument = result.current.getDocumentById('non-existent');
      expect(nonExistentDocument).toBeNull();
    });

    it('should get documents by category', () => {
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const { result } = renderHook(() => useDocumentStore());

      const personalDocs = result.current.getDocumentsByCategory('personal');
      expect(personalDocs).toHaveLength(1);
      expect(personalDocs[0].category).toBe('personal');

      const financialDocs = result.current.getDocumentsByCategory('financial');
      expect(financialDocs).toHaveLength(1);
      expect(financialDocs[0].category).toBe('financial');
    });

    it('should get expiring documents', () => {
      // Create a document that expires within 90 days
      const today = new Date();
      const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      const expiringDoc = {
        ...mockDocuments[1],
        expiryDate: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      };

      act(() => {
        useDocumentStore.setState({ documents: [mockDocuments[0], expiringDoc] });
      });

      const { result } = renderHook(() => useDocumentStore());

      const expiringDocs = result.current.getExpiringDocuments();
      expect(expiringDocs).toHaveLength(1);
      expect(expiringDocs[0].name).toBe('Insurance Policy');
    });

    it('should get expired documents', () => {
      // Create a document that's already expired
      const expiredDoc = {
        ...mockDocuments[1],
        expiryDate: '2023-01-01', // Past date
      };

      act(() => {
        useDocumentStore.setState({ documents: [mockDocuments[0], expiredDoc] });
      });

      const { result } = renderHook(() => useDocumentStore());

      const expiredDocs = result.current.getExpiredDocuments();
      expect(expiredDocs).toHaveLength(1);
      expect(expiredDocs[0].name).toBe('Insurance Policy');
    });

    it('should search documents', () => {
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const { result } = renderHook(() => useDocumentStore());

      const searchResults = result.current.searchDocuments('Passport');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Passport');

      const authorityResults = result.current.searchDocuments('State');
      expect(authorityResults).toHaveLength(2);
    });

    it('should get documents by person', () => {
      const docWithPerson = {
        ...mockDocuments[0],
        assignedPeople: ['person-1', 'person-2'],
      };

      act(() => {
        useDocumentStore.setState({ documents: [docWithPerson, mockDocuments[1]] });
      });

      const { result } = renderHook(() => useDocumentStore());

      const docsByPerson = result.current.getDocumentsByPerson('person-1');
      expect(docsByPerson).toHaveLength(1);
      expect(docsByPerson[0].name).toBe('Passport');
    });

    it('should get documents by status', () => {
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const { result } = renderHook(() => useDocumentStore());

      const activeDocs = result.current.getDocumentsByStatus('active');
      expect(activeDocs).toHaveLength(2);
      expect(activeDocs.every(doc => doc.status === 'active')).toBe(true);
    });
  });

  describe('Selectors', () => {
    it('should useDocuments selector work correctly', () => {
      act(() => {
        useDocumentStore.setState({ documents: mockDocuments });
      });

      const { result } = renderHook(() => useDocuments());
      expect(result.current).toEqual(mockDocuments);
    });
  });
});
