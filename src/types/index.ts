// Core LegacyGuard Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  plan: "starter" | "premium" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

export interface Guardian {
  id: string;
  userId: string;
  guardianEmail: string;
  guardianName: string;
  relationship: string;
  permissions: GuardianPermission[];
  status: "pending" | "active" | "suspended";
  verifiedAt?: Date;
  createdAt: Date;
}

export interface GuardianPermission {
  id: string;
  type: "view" | "download" | "manage";
  scope: "all" | "specific";
  resources?: string[];
}

export interface HeritageItem {
  id: string;
  userId: string;
  type: "document" | "photo" | "video" | "audio" | "story";
  title: string;
  description?: string;
  filePath?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  isPrivate: boolean;
  accessConditions?: AccessCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessCondition {
  id: string;
  type: "time_lock" | "guardian_approval" | "special_event";
  parameters: Record<string, unknown>;
  description: string;
}

export interface Vault {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: HeritageItem[];
  shareSettings: VaultShareSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultShareSettings {
  isPublic: boolean;
  allowedGuardians: string[];
  accessLevel: "view" | "download" | "manage";
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: "login" | "file_access" | "guardian_action" | "security_alert";
  description: string;
  severity: "info" | "warning" | "critical";
  metadata: Record<string, unknown>;
  timestamp: Date;
}

// Common Component Interfaces
export interface BaseComponentProps {
  /** Unique identifier for the component */
  id?: string;
  /** Optional callback when data changes */
  onChange?: (data: Record<string, unknown>) => void;
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Optional CSS class name */
  className?: string;
}

export interface FormComponentProps extends BaseComponentProps {
  /** Form submission handler */
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  /** Form cancellation handler */
  onCancel?: () => void;
  /** Initial form data */
  initialData?: Record<string, unknown>;
  /** Whether the form is in editing mode */
  isEditing?: boolean;
}

export interface CardComponentProps extends BaseComponentProps {
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Card actions */
  actions?: React.ReactNode;
  /** Card footer */
  footer?: React.ReactNode;
}

// Common Data Interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NamedEntity extends BaseEntity {
  name: string;
  description?: string;
}

export interface UserEntity extends BaseEntity {
  userId: string;
}

// Common Status Types
export type Status =
  | "pending"
  | "active"
  | "inactive"
  | "suspended"
  | "deleted";
export type Severity = "info" | "warning" | "error" | "success" | "critical";
export type Priority = "low" | "medium" | "high" | "urgent";
