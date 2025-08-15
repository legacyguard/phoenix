# Database Schema Documentation

## Overview
This document describes the database schema for the LegacyGuard application, including all tables, relationships, and constraints.

## Tables

### HeartbeatGuardianLink
A join table linking UserSettings to Guardian for the Heart-Beat protocol, capturing the priority order in which guardians should be contacted.

| Column          | Type      | Constraints                                        | Description                                                  |
|-----------------|-----------|----------------------------------------------------|--------------------------------------------------------------|
| id              | UUID      | PRIMARY KEY, DEFAULT uuid_generate_v4()            | Unique link identifier                                       |
| userSettingsId  | UUID      | FOREIGN KEY (UserSettings.id), NOT NULL            | The UserSettings this link belongs to                        |
| guardianId      | UUID      | FOREIGN KEY (Guardian.id), NOT NULL                | The Guardian to contact                                      |
| priority        | INTEGER   | NOT NULL                                           | The order to contact the guardian (1, 2, 3, ...)             |
| createdAt       | TIMESTAMP | DEFAULT NOW()                                      | Link creation timestamp                                      |

- Composite unique key on (userSettingsId, guardianId) prevents duplicate links for the same settings and guardian.
- Composite unique key on (userSettingsId, priority) ensures that each priority is used only once within a given user's settings.
- On delete cascade: deleting either the referenced UserSettings or Guardian will automatically delete the link to maintain data consistency.

### User
Stores user account information and authentication details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| passwordHash | VARCHAR(255) | NOT NULL | Hashed password using bcrypt |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Relationships:**
- One-to-many with Asset (user.assets)
- One-to-many with Guardian (user.guardians)
- One-to-one with UserSettings (user.settings)

### Asset
Represents user-owned assets with metadata and categorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique asset identifier |
| userId | UUID | FOREIGN KEY (User.id), NOT NULL | Owner of the asset |
| name | VARCHAR(255) | NOT NULL | Asset name/description |
| description | TEXT | NULL | Detailed asset description |
| type | AssetType | NOT NULL | Category of the asset |
| value | DECIMAL(15,2) | NOT NULL | Estimated monetary value |
| createdAt | TIMESTAMP | DEFAULT NOW() | Asset creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Relationships:**
- Many-to-one with User (asset.user)
- One-to-many with AssetAttachment (asset.attachments)

**AssetType Enum Values:**
- REAL_ESTATE: Real estate properties
- VEHICLE: Cars, boats, motorcycles, etc.
- DIGITAL_ASSET: Cryptocurrency, NFTs, digital files
- INVESTMENT: Stocks, bonds, mutual funds
- OTHER: Miscellaneous assets

### AssetAttachment
Stores file attachments associated with assets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique attachment identifier |
| assetId | UUID | FOREIGN KEY (Asset.id), NOT NULL | Associated asset |
| filePath | VARCHAR(500) | NOT NULL | Path in Supabase Storage |
| fileName | VARCHAR(255) | NOT NULL | Original filename |
| fileType | VARCHAR(100) | NOT NULL | MIME type of the file |
| fileSize | INTEGER | NOT NULL | File size in bytes |
| createdAt | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Relationships:**
- Many-to-one with Asset (attachment.asset)

### Guardian
Represents trusted individuals designated by users for asset management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique guardian identifier |
| userId | UUID | FOREIGN KEY (User.id), NOT NULL | User who designated this guardian |
| firstName | VARCHAR(100) | NOT NULL | Guardian's first name |
| lastName | VARCHAR(100) | NOT NULL | Guardian's last name |
| email | VARCHAR(255) | NOT NULL | Guardian's email address |
| phone | VARCHAR(20) | NULL | Guardian's phone number |
| relationship | VARCHAR(100) | NOT NULL | Relationship to the user |
| status | GuardianStatus | NOT NULL, DEFAULT ACTIVE | Current guardian status |
| accessPermissions | GuardianPermission[] | NOT NULL, DEFAULT ['READ'] | Permissions granted |
| createdAt | TIMESTAMP | DEFAULT NOW() | Guardian designation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Relationships:**
- Many-to-one with User (guardian.user)
- Linked to UserSettings via HeartbeatGuardianLink for Heart-Beat contact order

**Constraints:**
- Composite unique constraint on (userId, email)

**GuardianStatus Enum Values:**
- ACTIVE: Guardian is currently active
- INACTIVE: Guardian is temporarily inactive
- SUSPENDED: Guardian access is suspended
- REMOVED: Guardian has been removed

**GuardianPermission Enum Values:**
- READ: Can view asset information
- WRITE: Can modify asset details
- DELETE: Can remove assets
- ADMIN: Full administrative access

### UserSettings
Stores user-specific configuration and preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique settings identifier |
| userId | UUID | FOREIGN KEY (User.id), UNIQUE, NOT NULL | Associated user |
| heartbeatIntervalDays | INTEGER | NOT NULL, DEFAULT 30 | Heart-beat check interval |
| lastHeartbeatAt | TIMESTAMP | NULL | Last heart-beat timestamp |
| isHeartbeatActive | BOOLEAN | NOT NULL, DEFAULT FALSE | Heart-beat monitoring status |
| notificationChannels | STRING[] | NOT NULL, DEFAULT [] | Preferred notification channels |
| createdAt | TIMESTAMP | DEFAULT NOW() | Settings creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Relationships:**
- One-to-one with User (settings.user)
- Linked to Guardian via HeartbeatGuardianLink for Heart-Beat contact order

**Notification Channels:**
- email: Email notifications
- sms: SMS notifications (future)
- push: Push notifications (future)

### Plan
Represents subscription plans and pricing tiers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique plan identifier |
| name | VARCHAR(100) | NOT NULL | Plan name |
| description | TEXT | NULL | Plan description |
| price | DECIMAL(10,2) | NOT NULL | Monthly price |
| features | JSONB | NOT NULL | Plan features and limits |
| isActive | BOOLEAN | NOT NULL, DEFAULT TRUE | Plan availability status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Plan creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

### Document
Represents uploaded documents and their metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique document identifier |
| userId | UUID | FOREIGN KEY (User.id), NOT NULL | Document owner |
| title | VARCHAR(255) | NOT NULL | Document title |
| description | TEXT | NULL | Document description |
| filePath | VARCHAR(500) | NOT NULL | Path in Supabase Storage |
| fileType | VARCHAR(100) | NOT NULL | Document MIME type |
| fileSize | INTEGER | NOT NULL | File size in bytes |
| category | DocumentCategory | NOT NULL | Document category |
| tags | STRING[] | NULL | Document tags for organization |
| isEncrypted | BOOLEAN | NOT NULL, DEFAULT FALSE | Encryption status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Relationships:**
- Many-to-one with User (document.user)

**DocumentCategory Enum Values:**
- LEGAL: Legal documents, contracts, wills
- FINANCIAL: Bank statements, tax returns
- INSURANCE: Insurance policies, claims
- MEDICAL: Medical records, prescriptions
- PERSONAL: Personal documents, IDs
- OTHER: Miscellaneous documents

### TimeCapsule
Represents time-delayed messages or documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique time capsule identifier |
| userId | UUID | FOREIGN KEY (User.id), NOT NULL | Time capsule creator |
| title | VARCHAR(255) | NOT NULL | Time capsule title |
| message | TEXT | NOT NULL | Time capsule content |
| scheduledDate | TIMESTAMP | NOT NULL | Scheduled release date |
| isActive | BOOLEAN | NOT NULL, DEFAULT TRUE | Time capsule status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Relationships:**
- Many-to-one with User (timeCapsule.user)

## Database Functions and Extensions

### UUID Extension
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Timestamp Triggers
All tables with `updatedAt` columns automatically update this field when records are modified.

## Indexes and Performance

### Primary Indexes
- All tables have primary key indexes on their `id` columns
- User table has unique index on `email` column
- UserSettings table has unique index on `userId` column

### Foreign Key Indexes
- Asset table: `userId` index for user asset queries
- Guardian table: `userId` index for user guardian queries
- AssetAttachment table: `assetId` index for asset attachment queries
- Document table: `userId` index for user document queries
- TimeCapsule table: `userId` index for user time capsule queries

### Composite Indexes
- Guardian table: `(userId, email)` unique composite index

## Data Integrity

### Foreign Key Constraints
All foreign key relationships are properly defined with CASCADE or RESTRICT rules as appropriate.

### Check Constraints
- Asset value must be positive
- Heartbeat interval must be between 7 and 365 days
- Guardian permissions must contain valid enum values

### Not Null Constraints
Critical fields are marked as NOT NULL to prevent data corruption.

## Security Considerations

### Password Security
- Passwords are never stored in plain text
- All passwords are hashed using bcrypt with salt rounds of 10

### Data Access
- Users can only access their own data
- All API endpoints require proper authentication
- JWT tokens are used for session management

### File Storage
- Files are stored in Supabase Storage with proper access controls
- File paths are generated using UUIDs to prevent enumeration attacks
- File size and type validation is enforced
