import { supabase } from '@/integrations/supabase/client';
import type { ProcessedDocument, EncryptedFile, StorageOptions } from './document-upload.types';
import { 
  generateKey, 
  encryptFile, 
  decryptFile,
  storeEncryptionKey,
  retrieveEncryptionKey 
} from '../utils/encryption-utils';

// Document storage service
export class DocumentStorageService {
  // Store document securely with client-side encryption
  async storeDocument(
    file: File,
    document: ProcessedDocument,
    options: StorageOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate encryption key
      const encryptionKey = await generateKey();

      // Encrypt file
      const encryptedFile = await encryptFile(file, encryptionKey);

      // Store encryption key locally
      await storeEncryptionKey(document.id, encryptionKey);

      // Determine storage location
      if (options.location === 'local' || options.location === 'both') {
        await this.storeLocalEncrypted(encryptedFile, document);
      }

      if (options.location === 'cloud' || options.location === 'both') {
        await this.storeCloudEncrypted(encryptedFile, document);
      }

      return { success: true };
    } catch (error) {
      console.error('Storage error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Storage failed' 
      };
    }
  }

  // Store encrypted document locally
  private async storeLocalEncrypted(
    encryptedFile: EncryptedFile,
    document: ProcessedDocument,
  ): Promise<void> {
    const db = await this.openDatabase();

    // Store in IndexedDB
    const transaction = db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        id: document.id,
        document: document,
        fileData: encryptedFile,
        encrypted: true,
        storedAt: new Date(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  }

  // Store encrypted document in Supabase
  private async storeCloudEncrypted(
    encryptedFile: EncryptedFile,
    document: ProcessedDocument,
  ): Promise<void> {
    // Convert encrypted data to file
    const fileToUpload = new Blob(
      [encryptedFile.encryptedData],
      { type: 'application/octet-stream' }
    );

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${document.id}/${document.id}.encrypted`, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/octet-stream',
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Store encryption metadata
    await this.storeCloudEncryptionMetadata(document.id, {
      iv: Array.from(encryptedFile.iv),
      method: encryptedFile.encryptionMethod,
      originalName: encryptedFile.metadata.originalName,
      originalType: encryptedFile.metadata.mimeType,
    });

    // Note: The encryption key is stored locally and never uploaded
  }

  // Store document locally in IndexedDB
  private async storeLocal(
    file: File,
    document: ProcessedDocument,
    encrypt: boolean
  ): Promise<void> {
    const db = await this.openDatabase();
    
    let dataToStore: ArrayBuffer | EncryptedFile;
    let encryptionKey: CryptoKey | null = null;

    if (encrypt) {
      // Generate and store encryption key
      encryptionKey = await generateKey();
      await storeEncryptionKey(document.id, encryptionKey);
      
      // Encrypt file
      dataToStore = await encryptFile(file, encryptionKey);
    } else {
      // Store raw file data
      dataToStore = await file.arrayBuffer();
    }

    // Store in IndexedDB
    const transaction = db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        id: document.id,
        document: document,
        fileData: dataToStore,
        encrypted: encrypt,
        storedAt: new Date(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  }

  // Store document in Supabase
  private async storeCloud(
    file: File,
    document: ProcessedDocument,
    encrypt: boolean
  ): Promise<void> {
    let fileToUpload: File = file;
    let encryptionKey: CryptoKey | null = null;

    if (encrypt) {
      // Encrypt file before uploading
      encryptionKey = await generateKey();
      const encryptedData = await encryptFile(file, encryptionKey);
      
      // Convert encrypted data to file
      fileToUpload = new File(
        [encryptedData.encryptedData],
        `${document.id}.encrypted`,
        { type: 'application/octet-stream' }
      );

      // Store encryption metadata
      await this.storeCloudEncryptionMetadata(document.id, {
        iv: Array.from(encryptedData.iv),
        method: encryptedData.encryptionMethod,
        originalName: file.name,
        originalType: file.type,
      });

      // Store key locally (never in cloud)
      await storeEncryptionKey(document.id, encryptionKey);
    }

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${document.id}/${fileToUpload.name}`, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Store document metadata in database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        id: document.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        file_name: document.originalName,
        display_name: document.displayName,
        document_type: document.type,
        category: document.category,
        file_size: document.size,
        mime_type: document.metadata.mimeType,
        encrypted: encrypt,
        ocr_text: document.ocrText,
        extracted_data: document.extractedData,
        ai_analysis: document.aiAnalysis,
        metadata: document.metadata,
        thumbnail: document.thumbnail,
        storage_location: 'cloud',
      });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }
  }

  // Store encryption metadata in Supabase
  private async storeCloudEncryptionMetadata(
    documentId: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabase
      .from('document_encryption')
      .insert({
        document_id: documentId,
        encryption_metadata: metadata,
      });

    if (error) {
      throw new Error(`Failed to store encryption metadata: ${error.message}`);
    }
  }

  // Retrieve document from storage
  async retrieveDocument(
    documentId: string,
    location: 'local' | 'cloud'
  ): Promise<File | null> {
    try {
      if (location === 'local') {
        return await this.retrieveLocal(documentId);
      } else {
        return await this.retrieveCloud(documentId);
      }
    } catch (error) {
      console.error('Retrieval error:', error);
      return null;
    }
  }

  // Retrieve from local storage
  private async retrieveLocal(documentId: string): Promise<File | null> {
    const db = await this.openDatabase();
    
    const transaction = db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');

    const data = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = store.get(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!data) return null;

    // Handle decryption if needed
    if (data.encrypted) {
      const key = await retrieveEncryptionKey(documentId);
      if (!key) {
        throw new Error('Encryption key not found');
      }

      return await decryptFile(data.fileData as EncryptedFile, key);
    } else {
      // Reconstruct file from ArrayBuffer
      return new File(
        [data.fileData],
        data.document.originalName,
        { type: data.document.metadata.mimeType }
      );
    }
  }

  // Retrieve from cloud storage
  private async retrieveCloud(documentId: string): Promise<File | null> {
    // Get document metadata
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !docData) {
      throw new Error('Document not found');
    }

    // Download file from storage
    const fileName = docData.encrypted ? `${documentId}.encrypted` : docData.file_name;
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(`${documentId}/${fileName}`);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Handle decryption if needed
    if (docData.encrypted) {
      // Get encryption metadata
      const { data: encData } = await supabase
        .from('document_encryption')
        .select('encryption_metadata')
        .eq('document_id', documentId)
        .single();

      if (!encData) {
        throw new Error('Encryption metadata not found');
      }

      // Get encryption key (stored locally)
      const key = await retrieveEncryptionKey(documentId);
      if (!key) {
        throw new Error('Encryption key not found');
      }

      // Reconstruct encrypted file object
      const encryptedFile: EncryptedFile = {
        encryptedData: await fileData.arrayBuffer(),
        encryptionMethod: encData.encryption_metadata.method,
        iv: new Uint8Array(encData.encryption_metadata.iv),
        metadata: {
          originalName: encData.encryption_metadata.originalName,
          mimeType: encData.encryption_metadata.originalType,
          size: docData.file_size,
          checksum: '',
        },
      };

      return await decryptFile(encryptedFile, key);
    } else {
      // Return unencrypted file
      return new File(
        [fileData],
        docData.file_name,
        { type: docData.mime_type }
      );
    }
  }

  // Delete document from storage
  async deleteDocument(
    documentId: string,
    location: 'local' | 'cloud' | 'both'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (location === 'local' || location === 'both') {
        await this.deleteLocal(documentId);
      }

      if (location === 'cloud' || location === 'both') {
        await this.deleteCloud(documentId);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  // Delete from local storage
  private async deleteLocal(documentId: string): Promise<void> {
    const db = await this.openDatabase();
    
    const transaction = db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(documentId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();

    // Also delete encryption key
    // TODO: Implement key deletion from IndexedDB
  }

  // Delete from cloud storage
  private async deleteCloud(documentId: string): Promise<void> {
    // Delete from storage bucket
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([`${documentId}/`]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new Error(`Database deletion error: ${dbError.message}`);
    }

    // Delete encryption metadata
    await supabase
      .from('document_encryption')
      .delete()
      .eq('document_id', documentId);
  }

  // Open IndexedDB database
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LegacyGuardDocuments', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' });
          store.createIndex('storedAt', 'storedAt', { unique: false });
          store.createIndex('category', 'document.category', { unique: false });
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    localCount: number;
    cloudCount: number;
    totalSize: number;
  }> {
    let localCount = 0;
    let totalSize = 0;

    // Get local stats
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      
      const countRequest = store.count();
      localCount = await new Promise<number>((resolve) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
      });
      
      db.close();
    } catch (error) {
      console.error('Error getting local stats:', error);
    }

    // Get cloud stats
    let cloudCount = 0;
    try {
      const { count, data } = await supabase
        .from('documents')
        .select('file_size', { count: 'exact' });
      
      cloudCount = count || 0;
      if (data) {
        totalSize = data.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
      }
    } catch (error) {
      console.error('Error getting cloud stats:', error);
    }

    return { localCount, cloudCount, totalSize };
  }
}

// Export singleton instance
export const documentStorage = new DocumentStorageService();
