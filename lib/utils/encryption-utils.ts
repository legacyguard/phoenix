import type { EncryptedFile } from "../services/document-upload.types";

// Generate a random encryption key
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

// Export key for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from storage
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", keyData, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

// Encrypt a file
export async function encryptFile(
  file: File,
  key: CryptoKey,
): Promise<EncryptedFile> {
  // Read file as ArrayBuffer
  const fileData = await file.arrayBuffer();

  // Generate random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileData,
  );

  // Calculate checksum of original file
  const checksum = await calculateChecksum(fileData);

  return {
    encryptedData,
    encryptionMethod: "AES-GCM",
    iv,
    metadata: {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      checksum,
    },
  };
}

// Decrypt a file
export async function decryptFile(
  encryptedFile: EncryptedFile,
  key: CryptoKey,
): Promise<File> {
  try {
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedFile.iv,
      },
      key,
      encryptedFile.encryptedData,
    );

    // Create a new File object
    const file = new File(
      [decryptedData],
      encryptedFile.metadata.originalName,
      {
        type: encryptedFile.metadata.mimeType,
      },
    );

    return file;
  } catch (error) {
    throw new Error("Failed to decrypt file. The key might be incorrect.");
  }
}

// Calculate SHA-256 checksum
export async function calculateChecksum(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate a secure password for sharing
export function generateSecurePassword(length: number = 16): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => charset[x % charset.length])
    .join("");
}

// Derive a key from a password (for sharing)
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  // Derive a key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

// Create a shareable encrypted package
export async function createShareablePackage(
  file: File,
  password: string,
): Promise<{
  encryptedFile: EncryptedFile;
  salt: Uint8Array;
  checksum: string;
}> {
  // Generate salt for password derivation
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key from password
  const key = await deriveKeyFromPassword(password, salt);

  // Encrypt file
  const encryptedFile = await encryptFile(file, key);

  return {
    encryptedFile,
    salt,
    checksum: encryptedFile.metadata.checksum,
  };
}

// Decrypt a shareable package
export async function decryptShareablePackage(
  encryptedFile: EncryptedFile,
  password: string,
  salt: Uint8Array,
): Promise<File> {
  // Derive key from password
  const key = await deriveKeyFromPassword(password, salt);

  // Decrypt file
  return decryptFile(encryptedFile, key);
}

// Store encryption key securely (using IndexedDB)
export async function storeEncryptionKey(
  documentId: string,
  key: CryptoKey,
): Promise<void> {
  const keyString = await exportKey(key);

  // Open IndexedDB
  const db = await openKeyDatabase();

  // Store key
  const transaction = db.transaction(["keys"], "readwrite");
  const store = transaction.objectStore("keys");

  await new Promise<void>((resolve, reject) => {
    const request = store.put({
      documentId,
      key: keyString,
      createdAt: new Date(),
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  db.close();
}

// Retrieve encryption key
export async function retrieveEncryptionKey(
  documentId: string,
): Promise<CryptoKey | null> {
  const db = await openKeyDatabase();

  const transaction = db.transaction(["keys"], "readonly");
  const store = transaction.objectStore("keys");

  const keyData = await new Promise<Record<string, unknown>>(
    (resolve, reject) => {
      const request = store.get(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    },
  );

  db.close();

  if (!keyData) return null;

  return importKey(keyData.key);
}

// Open or create key database
async function openKeyDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LegacyGuardKeys", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        const store = db.createObjectStore("keys", { keyPath: "documentId" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generate a shareable link (for demonstration)
export function generateShareableLink(
  documentId: string,
  password: string,
  expiryHours: number = 24,
): string {
  // In production, this would create a secure link on the server
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + expiryHours);

  const params = new URLSearchParams({
    id: documentId,
    pwd: btoa(password), // Don't do this in production!
    exp: expiry.toISOString(),
  });

  return `${window.location.origin}/shared?${params.toString()}`;
}
