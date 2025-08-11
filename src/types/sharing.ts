export type ContentType =
  | "playbook_section"
  | "asset_summary"
  | "inheritance_allocation"
  | "document";

export type ShareExpiration = "24h" | "7d" | "30d" | "never";

export interface SharedLink {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  token: string;
  title?: string;
  description?: string;
  expires_at?: string;
  password_hash?: string;
  max_views?: number;
  view_count: number;
  settings: ShareSettings;
  created_at: string;
  updated_at: string;
  revoked_at?: string;
}

export interface ShareSettings {
  watermark?: boolean;
  allow_download?: boolean;
  require_email?: boolean;
  custom_message?: string;
  sections?: string[]; // For playbook section sharing
}

export interface SharedLinkAccessLog {
  id: string;
  shared_link_id: string;
  accessed_at: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  device_info?: {
    type?: string;
    browser?: string;
    os?: string;
  };
}

export interface CreateShareLinkParams {
  content_type: ContentType;
  content_id: string;
  title?: string;
  description?: string;
  expiration: ShareExpiration;
  password?: string;
  max_views?: number;
  settings?: ShareSettings;
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
  contentTitle?: string;
  onShare?: (link: SharedLink) => void;
}

export interface SharedContentViewerProps {
  token: string;
  password?: string;
}

export interface ShareLinkResponse {
  link: string;
  qrCode: string;
  expiresAt?: string;
}

export interface PlaybookSection {
  id: string;
  name: string;
  description?: string;
  shareable: boolean;
}

export interface AssetSummaryShareData {
  totalAssets: number;
  categories: {
    name: string;
    count: number;
    percentage: number;
  }[];
  lastUpdated: string;
}

export interface InheritanceAllocationShareData {
  beneficiaries: {
    name: string;
    relationship: string;
    allocation: number;
  }[];
  totalAllocated: number;
  unallocated: number;
}
