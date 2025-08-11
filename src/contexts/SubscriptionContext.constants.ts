// Feature access mapping
export const FEATURE_ACCESS = {
  free: ["basic_will", "basic_assets", "basic_guardians"],
  premium: [
    "basic_will",
    "basic_assets",
    "basic_guardians",
    "unlimited_wills",
    "unlimited_assets",
    "unlimited_guardians",
    "document_encryption",
    "emergency_access",
    "version_history",
    "legal_templates",
    "priority_support",
    "sharing_links",
    "advanced_notifications",
  ],
} as const;
