// LegacyGuard Platform Constants

export const PLAN_LIMITS = {
  starter: {
    storage: 500 * 1024 * 1024, // 500MB in bytes
    guardians: 3,
    features: ['basic_encryption', 'email_support', 'basic_guardian_playbook']
  },
  premium: {
    storage: 10 * 1024 * 1024 * 1024, // 10GB in bytes
    guardians: 5,
    features: ['military_encryption', 'priority_support', 'time_locks', 'advanced_sharing']
  },
  enterprise: {
    storage: 500 * 1024 * 1024 * 1024, // 500GB in bytes
    guardians: -1, // unlimited
    features: ['custom_encryption', 'white_glove_support', 'legal_docs', 'api_access', 'custom_branding']
  }
} as const;

export const SUPPORTED_FILE_TYPES = {
  documents: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  videos: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  audio: ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
} as const;

export const MAX_FILE_SIZES = {
  starter: 10 * 1024 * 1024, // 10MB
  premium: 50 * 1024 * 1024, // 50MB
  enterprise: 500 * 1024 * 1024 // 500MB
} as const;

export const GUARDIAN_RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Friend',
  'Legal Representative',
  'Executor',
  'Trustee',
  'Other'
] as const;

export const HERITAGE_CATEGORIES = [
  'Family Photos',
  'Important Documents',
  'Personal Stories',
  'Family History',
  'Legal Papers',
  'Financial Records',
  'Medical Records',
  'Creative Works',
  'Business Documents',
  'Other'
] as const;

export const SECURITY_LEVELS = {
  basic: {
    encryption: 'AES-128',
    backup_copies: 2,
    geographic_distribution: 1
  },
  military: {
    encryption: 'AES-256',
    backup_copies: 3,
    geographic_distribution: 2
  },
  custom: {
    encryption: 'Custom Key Management',
    backup_copies: 5,
    geographic_distribution: 3
  }
} as const;

// API and External Service URLs
export const API_URLS = {
  geolocation: 'https://ipapi.co/json/',
  openai: 'https://api.openai.com/v1/chat/completions',
  support: 'https://calendly.com/legacyguard/support',
  placeholder: 'https://via.placeholder.com/50',
  api: '/api' // Base API URL for internal endpoints
} as const;

// Development and Environment Constants
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  localhostDomains: ['localhost', '127.0.0.1', 'localhost:3000']
} as const;

// File Upload Constants
export const UPLOAD = {
  maxFiles: 10,
  acceptedTypes: ['image/*', 'application/pdf'] as string[],
  chunkSize: 1024 * 1024, // 1MB chunks for large file uploads
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
} as const;

// Notification Constants
export const NOTIFICATIONS = {
  defaultDuration: 5000, // 5 seconds
  maxVisible: 5,
  position: 'top-right' as const
} as const;

// Time Constants (in milliseconds)
export const TIME = {
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000,
  oneDay: 24 * 60 * 60 * 1000,
  oneWeek: 7 * 24 * 60 * 60 * 1000,
  oneMonth: 30 * 24 * 60 * 60 * 1000,
  oneYear: 365 * 24 * 60 * 60 * 1000
} as const;

// Cache Constants
export const CACHE = {
  geolocation: 24 * 60 * 60 * 1000, // 24 hours
  userPreferences: 60 * 60 * 1000, // 1 hour
  analytics: 5 * 60 * 1000 // 5 minutes
} as const;