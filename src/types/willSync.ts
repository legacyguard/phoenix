export interface WillSyncPreferences {
  id: string;
  user_id: string;
  auto_sync_enabled: boolean;
  sync_frequency: "immediate" | "daily" | "weekly";
  require_approval: boolean;
  sync_triggers: {
    asset_added: boolean;
    asset_removed: boolean;
    asset_value_changed: boolean;
    beneficiary_added: boolean;
    beneficiary_removed: boolean;
    guardian_changed: boolean;
    executor_changed: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface WillSyncLog {
  id: string;
  user_id: string;
  will_id: string;
  sync_type: string;
  trigger_event: string;
  changes_made: WillChanges;
  previous_version?: string;
  new_version?: string;
  status: "pending" | "approved" | "rejected" | "auto_applied";
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export interface WillVersion {
  id: string;
  will_id: string;
  version_number: number;
  content_snapshot: Record<string, unknown>; // Will content structure
  changes_from_previous?: WillChanges;
  created_by: "user" | "system" | "auto_sync";
  created_reason: string;
  is_current: boolean;
  created_at: string;
}

export interface WillSyncQueue {
  id: string;
  user_id: string;
  will_id: string;
  trigger_events: TriggerEvent[];
  scheduled_for: string;
  processed_at?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
}

export interface TriggerEvent {
  event: string;
  asset_id?: string;
  asset_name?: string;
  beneficiary_id?: string;
  beneficiary_name?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  timestamp: string;
}

export interface WillChanges {
  added?: {
    assets?: Array<{ id: string; name: string; allocation?: number }>;
    beneficiaries?: Array<{ id: string; name: string; allocation?: number }>;
    guardians?: Array<{ id: string; name: string; for_children: string[] }>;
    executors?: Array<{
      id: string;
      name: string;
      type: "primary" | "alternative";
    }>;
  };
  removed?: {
    assets?: Array<{ id: string; name: string }>;
    beneficiaries?: Array<{
      id: string;
      name: string;
      previous_allocation: number;
    }>;
    guardians?: Array<{ id: string; name: string }>;
    executors?: Array<{ id: string; name: string }>;
  };
  modified?: {
    assets?: Array<{
      id: string;
      name: string;
      field: string;
      old_value: Record<string, unknown>;
      new_value: Record<string, unknown>;
    }>;
    beneficiaries?: Array<{
      id: string;
      name: string;
      field: string;
      old_value: Record<string, unknown>;
      new_value: Record<string, unknown>;
    }>;
    allocations?: Array<{
      beneficiary_id: string;
      beneficiary_name: string;
      old_percentage: number;
      new_percentage: number;
    }>;
  };
}

export interface WillSyncNotification {
  id: string;
  type: "sync_completed" | "approval_required" | "sync_failed";
  title: string;
  message: string;
  changes_summary?: string;
  action_required?: boolean;
  action_url?: string;
  created_at: string;
}
