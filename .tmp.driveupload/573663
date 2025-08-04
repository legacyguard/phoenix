import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

interface BackupResult {
  success: boolean;
  backupId?: string;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

class WillBackupService {
  private encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || '';
  private backupBucket = process.env.WILL_BACKUP_BUCKET || 'will-backups';

  // Backup a generated will
  async backupWill(willId: string, willContent: Record<string, unknown>, userId: string): Promise<BackupResult> {
    try {
      // Encrypt will content
      const encryptedContent = this.encryptData(JSON.stringify(willContent));
      
      // Generate backup metadata
      const backupMetadata = {
        willId,
        userId,
        backupDate: new Date().toISOString(),
        checksum: this.generateChecksum(JSON.stringify(willContent)),
        version: Date.now()
      };

      // Create backup filename
      const filename = `${userId}/${willId}/backup_${Date.now()}.enc`;

      // Upload encrypted backup to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.backupBucket)
        .upload(filename, encryptedContent, {
          contentType: 'application/octet-stream',
          metadata: backupMetadata
        });

      if (uploadError) {
        console.error('Backup upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Store backup record in database
      const { data: backupRecord, error: dbError } = await supabase
        .from('will_backups')
        .insert({
          will_id: willId,
          user_id: userId,
          backup_path: filename,
          checksum: backupMetadata.checksum,
          encrypted: true,
          metadata: backupMetadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Backup record error:', dbError);
        // Try to delete uploaded file
        await supabase.storage.from(this.backupBucket).remove([filename]);
        return { success: false, error: dbError.message };
      }

      return { 
        success: true, 
        backupId: backupRecord.id 
      };
    } catch (error) {
      console.error('Backup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Restore a will from backup
  async restoreWillBackup(backupId: string, userId: string): Promise<RestoreResult> {
    try {
      // Fetch backup record
      const { data: backup, error: fetchError } = await supabase
        .from('will_backups')
        .select('*')
        .eq('id', backupId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !backup) {
        return { success: false, error: 'Backup not found' };
      }

      // Download encrypted backup
      const { data: encryptedData, error: downloadError } = await supabase.storage
        .from(this.backupBucket)
        .download(backup.backup_path);

      if (downloadError || !encryptedData) {
        return { success: false, error: 'Failed to download backup' };
      }

      // Convert blob to buffer
      const buffer = Buffer.from(await encryptedData.arrayBuffer());
      
      // Decrypt content
      const decryptedContent = this.decryptData(buffer);
      const willContent = JSON.parse(decryptedContent);

      // Verify checksum
      const checksum = this.generateChecksum(decryptedContent);
      if (checksum !== backup.checksum) {
        return { success: false, error: 'Backup integrity check failed' };
      }

      return { 
        success: true, 
        data: willContent 
      };
    } catch (error) {
      console.error('Restore error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // List available backups for a will
  async listWillBackups(willId: string, userId: string) {
    const { data, error } = await supabase
      .from('will_backups')
      .select('*')
      .eq('will_id', willId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing backups:', error);
      return [];
    }

    return data || [];
  }

  // Clean up old backups based on retention policy
  async cleanupOldBackups(): Promise<void> {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '365');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      // Find old backups
      const { data: oldBackups, error: fetchError } = await supabase
        .from('will_backups')
        .select('*')
        .lt('created_at', cutoffDate.toISOString());

      if (fetchError || !oldBackups) {
        console.error('Error fetching old backups:', fetchError);
        return;
      }

      // Delete old backup files and records
      for (const backup of oldBackups) {
        // Delete file from storage
        const { error: deleteError } = await supabase.storage
          .from(this.backupBucket)
          .remove([backup.backup_path]);

        if (deleteError) {
          console.error(`Error deleting backup file ${backup.backup_path}:`, deleteError);
          continue;
        }

        // Delete database record
        const { error: dbError } = await supabase
          .from('will_backups')
          .delete()
          .eq('id', backup.id);

        if (dbError) {
          console.error(`Error deleting backup record ${backup.id}:`, dbError);
        }
      }

      console.log(`Cleaned up ${oldBackups.length} old backups`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Encrypt data using AES-256-GCM
  private encryptData(data: string): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Combine iv + authTag + encrypted data
    return Buffer.concat([iv, authTag, encrypted]);
  }

  // Decrypt data
  private decryptData(encryptedData: Buffer): string {
    const iv = encryptedData.slice(0, 16);
    const authTag = encryptedData.slice(16, 32);
    const encrypted = encryptedData.slice(32);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }

  // Generate checksum for data integrity
  private generateChecksum(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  // Create a scheduled backup for all active wills
  async performScheduledBackup(): Promise<void> {
    try {
      // Get all active wills
      const { data: activeWills, error } = await supabase
        .from('generated_wills')
        .select('*')
        .in('status', ['completed', 'pending_signatures']);

      if (error || !activeWills) {
        console.error('Error fetching active wills:', error);
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      // Backup each will
      for (const will of activeWills) {
        const result = await this.backupWill(
          will.id,
          will.will_content,
          will.user_id
        );

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to backup will ${will.id}:`, result.error);
        }
      }

      console.log(`Scheduled backup completed: ${successCount} success, ${failureCount} failures`);

      // Clean up old backups
      await this.cleanupOldBackups();
    } catch (error) {
      console.error('Scheduled backup error:', error);
    }
  }
}

export const willBackupService = new WillBackupService();
