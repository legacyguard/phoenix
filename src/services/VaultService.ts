import { supabase } from "@/integrations/supabase/client";

type VaultDocument = { id: string; name: string; createdAt: Date };

async function uploadDocument(file: File): Promise<VaultDocument> {
  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw new Error(error.message || "Failed to upload document");
  }

  return { id: data.path, name: file.name, createdAt: new Date() };
}

async function listDocuments(): Promise<Array<VaultDocument>> {
  const { data, error } = await supabase.storage
    .from("documents")
    .list("", { sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    throw new Error(error.message || "Failed to list documents");
  }

  return (data || []).map((item: any) => ({
    id: item.name,
    name: item.name,
    createdAt: item.created_at ? new Date(item.created_at) : new Date(0),
  }));
}

async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.storage.from("documents").remove([id]);
  if (error) {
    throw new Error(error.message || "Failed to delete document");
  }
}

export const VaultService = { uploadDocument, listDocuments, deleteDocument };


