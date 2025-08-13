type Metadata = Record<string, string>;

function saveMetadata(docId: string, metadata: Metadata): void {
  const key = `documentMetadata_${docId}`;
  localStorage.setItem(key, JSON.stringify(metadata));
}

function getMetadata(docId: string): Metadata | null {
  const key = `documentMetadata_${docId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Metadata;
  } catch {
    return null;
  }
}

function deleteMetadata(docId: string): void {
  const key = `documentMetadata_${docId}`;
  localStorage.removeItem(key);
}

export const DocumentMetadataService = {
  saveMetadata,
  getMetadata,
  deleteMetadata,
};


