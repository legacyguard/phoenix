/**
 * Document Service - manages document data with localStorage
 * Following WARP.md privacy-first principles
 */

import { Document, DocumentFormData, DocumentStatus, DocumentFile } from '@/types/documents';
import { mockDocuments } from '@/features/documents-vault/data/mock-documents';

const STORAGE_KEY = 'legacyguard_documents';

// Initialize localStorage with mock data if empty
const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDocuments));
  }
};

// Calculate document status based on expiry date
const calculateStatus = (doc: Partial<Document>): DocumentStatus => {
  if (!doc.expiryDate) {
    return doc.status || 'active';
  }

  const today = new Date();
  const expiryDate = new Date(doc.expiryDate);
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry < 90) {
    // Document expires in less than 3 months - might need attention
    return 'active'; // You could return a custom status here
  }
  
  return 'active';
};

// Get all documents for the current user
export const getDocuments = async (): Promise<Document[]> => {
  initializeStorage();
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const documents = data ? JSON.parse(data) : [];
    
    // In a real app, filter by current user ID
    return documents;
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
};

// Get a single document by ID
export const getDocumentById = async (id: string): Promise<Document | null> => {
  const documents = await getDocuments();
  return documents.find(doc => doc.id === id) || null;
};

// Create a new document
export const createDocument = async (
  formData: DocumentFormData,
  file?: File
): Promise<Document> => {
  const documents = await getDocuments();
  
  // Create file metadata if file is provided
  let fileData: DocumentFile | undefined;
  if (file) {
    fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
    // In a real app, you would upload the file to a server here
    // and store the URL in fileData.url
  }
  
  const newDocument: Document = {
    ...formData,
    id: `doc-${Date.now()}`,
    userId: 'user-1', // In real app, get from auth
    status: calculateStatus(formData),
    file: fileData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedDocuments = [...documents, newDocument];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));
  
  return newDocument;
};

// Update an existing document
export const updateDocument = async (
  id: string, 
  updates: Partial<Document>,
  newFile?: File
): Promise<Document | null> => {
  const documents = await getDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Handle file update if provided
  let fileData = documents[index].file;
  if (newFile) {
    fileData = {
      name: newFile.name,
      type: newFile.type,
      size: newFile.size,
      uploadedAt: new Date().toISOString()
    };
    // In a real app, upload the file and update the URL
  }
  
  const updatedDocument: Document = {
    ...documents[index],
    ...updates,
    file: fileData,
    status: calculateStatus({ ...documents[index], ...updates }),
    updatedAt: new Date().toISOString()
  };
  
  documents[index] = updatedDocument;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  
  return updatedDocument;
};

// Delete a document
export const deleteDocument = async (id: string): Promise<boolean> => {
  const documents = await getDocuments();
  const filteredDocuments = documents.filter(doc => doc.id !== id);
  
  if (filteredDocuments.length === documents.length) {
    return false; // Document not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments));
  return true;
};

// Search documents
export const searchDocuments = async (query: string): Promise<Document[]> => {
  const documents = await getDocuments();
  const lowerQuery = query.toLowerCase();
  
  return documents.filter(doc => 
    doc.name.toLowerCase().includes(lowerQuery) ||
    doc.documentNumber?.toLowerCase().includes(lowerQuery) ||
    doc.issuingAuthority?.toLowerCase().includes(lowerQuery) ||
    doc.notes?.toLowerCase().includes(lowerQuery) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// Get documents by category
export const getDocumentsByCategory = async (category: string): Promise<Document[]> => {
  const documents = await getDocuments();
  return documents.filter(doc => doc.category === category);
};

// Get documents expiring soon (within 90 days)
export const getExpiringDocuments = async (): Promise<Document[]> => {
  const documents = await getDocuments();
  const today = new Date();
  const ninetyDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
  
  return documents.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
  });
};

// Get expired documents
export const getExpiredDocuments = async (): Promise<Document[]> => {
  const documents = await getDocuments();
  const today = new Date();
  
  return documents.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate < today;
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get documents by assigned person
export const getDocumentsByPerson = async (personId: string): Promise<Document[]> => {
  const documents = await getDocuments();
  return documents.filter(doc => 
    doc.assignedPeople?.includes(personId)
  );
};
