# Phoenix Project - Database Schema

This document defines the database structure for the Phoenix application. It serves as the single source of truth for all database models and their relations. The schema is written in a Prisma-like syntax for clarity and ease of use with AI code generation tools.

---

## Enums (Enumerated Types)

// Defines a set of possible roles for a user in the system.
enum Role {
  USER
  ADMIN
}

// Defines the status of a guardian's invitation or preparedness.
enum GuardianStatus {
  INVITED
  ACTIVE
  INACTIVE
}

// Defines the type of an asset.
enum AssetType {
  REAL_ESTATE
  VEHICLE
  DIGITAL_ASSET
  INVESTMENT
  OTHER
}

// Defines the type of a notification.
enum NotificationType {
  EMAIL
  SMS
  PUSH
}

---

## Models

### User Model
// Represents the main user of the application.
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  passwordHash    String
  firstName       String?
  lastName        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  role            Role     @default(USER)
  
  // User's plan and settings
  plan            Plan?
  settings        UserSettings?
  
  // Relations
  assets          Asset[]
  documents       Document[]
  guardians       Guardian[]
  timeCapsules    TimeCapsule[]
}

### UserSettings Model
// Stores user-specific settings, including the Dead Man's Switch configuration.
model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  // Heart-Beat Protocol Settings
  heartbeatIntervalDays Int @default(30) // e.g., check every 30 days
  heartbeatGracePeriodDays Int @default(90) // e.g., activate switch after 90 days of no response
  lastHeartbeatAck  DateTime? // Last time the user acknowledged the check-in
  
  // Notification Preferences
  notificationPreferences Json? // e.g., { email: true, sms: false }
}

### Plan Model
// Represents the user's subscription plan and overall preparedness.
model Plan {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  // Subscription Details
  subscriptionType String   @default("free") // "free", "premium"
  stripeCustomerId String?  @unique
  
  // Preparedness Score
  preparednessScore Int      @default(0) // Calculated score from 0 to 100
  lastScoreUpdate DateTime @updatedAt
}

### Guardian Model
// Represents a trusted person in the user's network.
model Guardian {
  id              String   @id @default(cuid())
  userId          String   // The main user who added this guardian
  user            User     @relation(fields: [userId], references: [id])
  
  email           String
  firstName       String
  lastName        String
  relationship    String?  // e.g., "Spouse", "Son", "Lawyer"
  status          GuardianStatus @default(INVITED)
  
  // Permissions
  accessPermissions Json?  // Defines what this guardian can see, e.g., { "financials": true, "documents": ["will.pdf"] }
  
  @@unique([userId, email])
}

### Asset Model
// Represents a single asset (financial, physical, digital).
model Asset {
  id              String    @id @default(uuid()) // UUID, equivalent to uuid_generate_v4()
  userId          String
  user            User      @relation(fields: [userId], references: [id])

  name            String                         // required
  description     String?                        // optional long description
  type            AssetType                      // required
  value           Decimal                        // required estimated value

  // Story attached to the asset
  story           String?

  // Relation to documents
  relatedDocuments Document[]
  attachments     AssetAttachment[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

### AssetAttachment Model
// Stores metadata for files uploaded to Supabase Storage and linked to an Asset.
model AssetAttachment {
  id         String   @id @default(uuid())
  assetId    String
  asset      Asset    @relation(fields: [assetId], references: [id])

  filePath   String   // e.g., user-uuid/asset-uuid/document.pdf
  fileName   String   // original file name
  fileType   String   // MIME type (e.g., application/pdf)
  fileSize   Int      // size in bytes

  createdAt  DateTime @default(now())
}

### Document Model
// Represents an uploaded document.
model Document {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  filename        String
  storagePath     String    // Path in the cloud storage (e.g., S3 key)
  filetype        String    // e.g., "application/pdf"
  size            Int       // in bytes
  
  // AI-extracted metadata
  classification  String?   // e.g., "Last Will", "Insurance Policy"
  extractedText   String?   // Full text from OCR
  metadata        Json?     // Extracted entities, e.g., { "policy_number": "123", "expiry_date": "2030-12-31" }
  
  // Relations
  assetId         String?
  asset           Asset?    @relation(fields: [assetId], references: [id])
  
  createdAt       DateTime  @default(now())
}

### TimeCapsule Model
// Represents a message or file to be released to specific people after the user's passing.
model TimeCapsule {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  title           String
  message         String?   // Text message
  attachmentPath  String?   // Path to a video/audio file
  
  releaseDate     DateTime? // Can be set to a specific date or triggered by the Dead Man's Switch
  
  // Who receives this?
  recipients      Json      // e.g., [{ "email": "son@example.com", "name": "John" }]
}
