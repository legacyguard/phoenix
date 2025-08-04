#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: string;
}

async function ensureMigrationsTable() {
  const { error } = await supabase.rpc('query', {
    query: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  });

  if (error) {
    console.error('Failed to create migrations table:', error);
    throw error;
  }
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('migrations')
    .select('filename');

  if (error) {
    console.error('Failed to fetch executed migrations:', error);
    throw error;
  }

  return new Set(data?.map(m => m.filename) || []);
}

async function executeMigration(filename: string, sql: string) {
  console.log(`Executing migration: ${filename}`);
  
  try {
    // Execute the SQL
    const { error: execError } = await supabase.rpc('query', { query: sql });
    
    if (execError) {
      throw execError;
    }

    // Record the migration
    const { error: recordError } = await supabase
      .from('migrations')
      .insert({ filename });

    if (recordError) {
      throw recordError;
    }

    console.log(`✓ Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`✗ Migration ${filename} failed:`, error);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Read all migration files
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const files = await readdir(migrationsDir);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    // Execute pending migrations
    let pendingCount = 0;
    for (const file of sqlFiles) {
      if (!executedMigrations.has(file)) {
        const sql = await readFile(join(migrationsDir, file), 'utf-8');
        await executeMigration(file, sql);
        pendingCount++;
      }
    }

    if (pendingCount === 0) {
      console.log('No pending migrations');
    } else {
      console.log(`Successfully executed ${pendingCount} migrations`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
