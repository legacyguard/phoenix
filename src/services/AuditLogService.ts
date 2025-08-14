import type { TSecurePayload } from './EncryptionService';

export type AuditEvent = {
  id: string; // Date.now().toString()
  type: 'create' | 'update' | 'delete' | 'sync';
  category: TSecurePayload<unknown>['category'];
  key?: string;
  ts: string; // ISO
  details?: Record<string, unknown>;
};

const LOG_KEY = 'auditLog_v1';

function readLog(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as AuditEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLog(events: AuditEvent[]): void {
  localStorage.setItem(LOG_KEY, JSON.stringify(events));
}

export const AuditLogService = {
  logEvent(evt: AuditEvent): void {
    const events = readLog();
    events.unshift(evt);
    // Keep a reasonable cap to avoid unbounded growth
    const capped = events.slice(0, 1000);
    writeLog(capped);
  },
  list(): AuditEvent[] {
    return readLog();
  },
  clear(): void {
    try { localStorage.removeItem(LOG_KEY); } catch {}
  },
};


