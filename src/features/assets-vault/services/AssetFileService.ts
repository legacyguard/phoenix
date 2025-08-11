import { supabase } from "@/lib/supabase";
import {
  generateKey,
  encryptFile,
  decryptFile,
  storeEncryptionKey,
  retrieveEncryptionKey,
  createShareablePackage,
  decryptShareablePackage,
  generateSecurePassword,
} from "@/lib/utils/encryption-utils";

export interface AssetFile {
  id: string;
  assetId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  encrypted: boolean;
  uploadedAt: Date;
  tags?: string[];
  sharedWith?: string[];
}

export interface AssetUploadOptions {
  assetId: string;
  tags?: string[];
  encrypt?: boolean;
  category?: string;
}

export interface AssetShare {
  id: string;
  assetFileId: string;
  sharedWithEmail: string;
  password?: string;
  expiresAt?: Date;
  accessCount: number;
  createdAt: Date;
  revokedAt?: Date;
}

export class AssetFileService {
  private readonly BUCKET_NAME = "asset-files";
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  /**
   * Upload and encrypt an asset file
   */
  async uploadAssetFile(
    file: File,
    options: AssetUploadOptions,
  ): Promise<AssetFile> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileId = crypto.randomUUID();
    const shouldEncrypt = options.encrypt !== false; // Default to true

    try {
      let uploadData: Blob;
      let encryptionMetadata: Record<string, unknown> | null = null;

      if (shouldEncrypt) {
        // Generate encryption key
        const encryptionKey = await generateKey();

        // Encrypt file
        const encryptedFile = await encryptFile(file, encryptionKey);

        // Store encryption key locally
        await storeEncryptionKey(fileId, encryptionKey);

        // Prepare upload data
        uploadData = new Blob([encryptedFile.encryptedData], {
          type: "application/octet-stream",
        });

        // Prepare encryption metadata
        encryptionMetadata = {
          iv: Array.from(encryptedFile.iv),
          method: encryptedFile.encryptionMethod,
          originalName: file.name,
          originalType: file.type,
          checksum: encryptedFile.metadata.checksum,
        };
      } else {
        uploadData = file;
      }

      // Upload to Supabase Storage
      const filePath = `${user.id}/${options.assetId}/${fileId}`;
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, uploadData, {
          cacheControl: "3600",
          upsert: false,
          contentType: shouldEncrypt ? "application/octet-stream" : file.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Store file metadata in database
      const assetFile: Partial<AssetFile> = {
        id: fileId,
        assetId: options.assetId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        encrypted: shouldEncrypt,
        uploadedAt: new Date(),
        tags: options.tags || [],
      };

      const { data: fileRecord, error: dbError } = await supabase
        .from("asset_files")
        .insert({
          ...assetFile,
          user_id: user.id,
          file_path: filePath,
          encryption_metadata: encryptionMetadata,
          category: options.category,
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup uploaded file on database error
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return fileRecord as AssetFile;
    } catch (error) {
      console.error("Asset upload error:", error);
      throw error;
    }
  }

  /**
   * Download and decrypt an asset file
   */
  async downloadAssetFile(fileId: string): Promise<File> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get file metadata
    const { data: fileRecord, error: dbError } = await supabase
      .from("asset_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (dbError || !fileRecord) {
      throw new Error("File not found");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(fileRecord.file_path);

    if (downloadError || !fileData) {
      throw new Error("Failed to download file");
    }

    // Handle decryption if needed
    if (fileRecord.encrypted && fileRecord.encryption_metadata) {
      const encryptionKey = await retrieveEncryptionKey(fileId);
      if (!encryptionKey) {
        throw new Error("Encryption key not found");
      }

      const encryptedFile = {
        encryptedData: await fileData.arrayBuffer(),
        encryptionMethod: fileRecord.encryption_metadata.method,
        iv: new Uint8Array(fileRecord.encryption_metadata.iv),
        metadata: {
          originalName: fileRecord.encryption_metadata.originalName,
          mimeType: fileRecord.encryption_metadata.originalType,
          size: fileRecord.file_size,
          checksum: fileRecord.encryption_metadata.checksum,
        },
      };

      return await decryptFile(encryptedFile, encryptionKey);
    } else {
      // Return unencrypted file
      return new File([fileData], fileRecord.file_name, {
        type: fileRecord.mime_type,
      });
    }
  }

  /**
   * Share an asset file with another user
   */
  async shareAssetFile(
    fileId: string,
    shareWithEmail: string,
    expiresInHours: number = 72,
  ): Promise<AssetShare> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Verify file ownership
    const { data: fileRecord } = await supabase
      .from("asset_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (!fileRecord) {
      throw new Error("File not found or access denied");
    }

    // Generate secure share package
    const shareId = crypto.randomUUID();
    const password = generateSecurePassword();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Download and create shareable package
    const file = await this.downloadAssetFile(fileId);
    const sharePackage = await createShareablePackage(file, password);

    // Upload shareable package
    const sharePath = `shares/${shareId}`;
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(
        sharePath,
        new Blob([
          JSON.stringify({
            encryptedFile: {
              encryptedData: Array.from(
                new Uint8Array(sharePackage.encryptedFile.encryptedData),
              ),
              encryptionMethod: sharePackage.encryptedFile.encryptionMethod,
              iv: Array.from(sharePackage.encryptedFile.iv),
              metadata: sharePackage.encryptedFile.metadata,
            },
            salt: Array.from(sharePackage.salt),
          }),
        ]),
        {
          contentType: "application/json",
        },
      );

    if (uploadError) {
      throw new Error("Failed to create share package");
    }

    // Store share metadata
    const { data: shareRecord, error: shareError } = await supabase
      .from("asset_shares")
      .insert({
        id: shareId,
        asset_file_id: fileId,
        shared_by: user.id,
        shared_with_email: shareWithEmail,
        share_path: sharePath,
        expires_at: expiresAt,
        access_count: 0,
        created_at: new Date(),
      })
      .select()
      .single();

    if (shareError) {
      // Cleanup on error
      await supabase.storage.from(this.BUCKET_NAME).remove([sharePath]);
      throw new Error("Failed to create share record");
    }

    // Send notification email (would be implemented separately)
    // await this.sendShareNotification(shareWithEmail, shareId, password);

    return {
      ...shareRecord,
      password,
    } as AssetShare;
  }

  /**
   * Revoke a shared asset
   */
  async revokeShare(shareId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get share record
    const { data: share } = await supabase
      .from("asset_shares")
      .select("*")
      .eq("id", shareId)
      .eq("shared_by", user.id)
      .single();

    if (!share) {
      throw new Error("Share not found");
    }

    // Remove share package
    await supabase.storage.from(this.BUCKET_NAME).remove([share.share_path]);

    // Update share record
    await supabase
      .from("asset_shares")
      .update({ revoked_at: new Date() })
      .eq("id", shareId);
  }

  /**
   * Add tags to an asset file
   */
  async updateTags(fileId: string, tags: string[]): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("asset_files")
      .update({ tags, updated_at: new Date() })
      .eq("id", fileId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to update tags");
    }
  }

  /**
   * Delete an asset file (soft delete with retention)
   */
  async deleteAssetFile(
    fileId: string,
    permanent: boolean = false,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    if (permanent) {
      // Get file record
      const { data: fileRecord } = await supabase
        .from("asset_files")
        .select("file_path")
        .eq("id", fileId)
        .eq("user_id", user.id)
        .single();

      if (!fileRecord) {
        throw new Error("File not found");
      }

      // Delete from storage
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileRecord.file_path]);

      // Delete from database
      await supabase.from("asset_files").delete().eq("id", fileId);

      // Delete encryption key
      // This would need to be implemented in encryption-utils
    } else {
      // Soft delete
      await supabase
        .from("asset_files")
        .update({
          deleted_at: new Date(),
          updated_at: new Date(),
        })
        .eq("id", fileId)
        .eq("user_id", user.id);
    }
  }

  /**
   * Search asset files
   */
  async searchAssetFiles(params: {
    assetId?: string;
    tags?: string[];
    category?: string;
    searchTerm?: string;
  }): Promise<AssetFile[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    let query = supabase
      .from("asset_files")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (params.assetId) {
      query = query.eq("asset_id", params.assetId);
    }

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.contains("tags", params.tags);
    }

    if (params.searchTerm) {
      query = query.ilike("file_name", `%${params.searchTerm}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error("Search failed");
    }

    return data as AssetFile[];
  }
}

export const assetFileService = new AssetFileService();
