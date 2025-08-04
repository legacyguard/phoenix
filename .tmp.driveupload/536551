#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface BackupStats {
  totalWills: number;
  totalUsers: number;
  backupSize: number;
  timestamp: string;
}

async function encryptData(data: string, key: string): Promise<Buffer> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, encrypted]);
}

async function backupWills(): Promise<BackupStats> {
  console.log('Starting will backup process...');
  
  try {
    // Fetch all wills with related data
    const { data: wills, error: willsError } = await supabase
      .from('generated_wills')
      .select(`
        *,
        will_signatures (*),
        will_witnesses (*),
        will_notarization (*),
        will_versions (*)
      `)
      .order('created_at', { ascending: false });

    if (willsError) throw willsError;

    // Fetch will templates
    const { data: templates, error: templatesError } = await supabase
      .from('will_templates')
      .select('*');

    if (templatesError) throw templatesError;

    // Create backup object
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        wills: wills || [],
        templates: templates || [],
      },
      metadata: {
        willCount: wills?.length || 0,
        templateCount: templates?.length || 0,
      },
    };

    // Convert to JSON and encrypt
    const backupJson = JSON.stringify(backup, null, 2);
    const encryptionKey = process.env.WILL_ENCRYPTION_KEY!;
    const encryptedData = await encryptData(backupJson, encryptionKey);

    // Generate backup filename
    const date = new Date();
    const filename = `backups/wills/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/wills-backup-${date.toISOString()}.json.enc`;

    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: process.env.WILL_BACKUP_BUCKET || 'legacyguard-backups',
      Key: filename,
      Body: encryptedData,
      ContentType: 'application/octet-stream',
      ServerSideEncryption: 'AES256',
      Metadata: {
        'backup-version': '1.0',
        'will-count': String(backup.metadata.willCount),
        'encrypted': 'true',
      },
    });

    await s3Client.send(putCommand);

    // Log backup record
    await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'wills',
        filename,
        size_bytes: encryptedData.length,
        item_count: backup.metadata.willCount,
        status: 'completed',
        metadata: backup.metadata,
      });

    const stats: BackupStats = {
      totalWills: backup.metadata.willCount,
      totalUsers: new Set(wills?.map(w => w.user_id) || []).size,
      backupSize: encryptedData.length,
      timestamp: backup.timestamp,
    };

    console.log('Backup completed successfully:', stats);
    return stats;

  } catch (error) {
    console.error('Backup failed:', error);
    
    // Log failure
    await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'wills',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

    throw error;
  }
}

async function cleanupOldBackups() {
  console.log('Cleaning up old backups...');
  
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '365');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const { data: oldBackups, error } = await supabase
    .from('backup_logs')
    .select('filename')
    .lt('created_at', cutoffDate.toISOString())
    .eq('status', 'completed');

  if (error) {
    console.error('Failed to fetch old backups:', error);
    return;
  }

  for (const backup of oldBackups || []) {
    try {
      // Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.WILL_BACKUP_BUCKET || 'legacyguard-backups',
        Key: backup.filename,
      }));

      // Update log
      await supabase
        .from('backup_logs')
        .update({ status: 'deleted' })
        .eq('filename', backup.filename);

      console.log(`Deleted old backup: ${backup.filename}`);
    } catch (error) {
      console.error(`Failed to delete backup ${backup.filename}:`, error);
    }
  }
}

// Main execution
async function main() {
  try {
    // Run backup
    await backupWills();
    
    // Cleanup old backups
    await cleanupOldBackups();
    
    process.exit(0);
  } catch (error) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
}

main();
