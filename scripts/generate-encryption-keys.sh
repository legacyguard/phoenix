#!/bin/bash

# Script to generate secure encryption keys for LegacyGuard Heritage Vault
# This script generates cryptographically secure random keys for production use

echo "🔐 LegacyGuard Heritage Vault - Encryption Key Generator"
echo "======================================================="
echo ""
echo "This script will generate secure encryption keys for your production environment."
echo "Make sure to store these keys securely and never commit them to version control."
echo ""

# Function to generate a secure random key
generate_key() {
    openssl rand -base64 32
}

# Function to generate a secure webhook secret
generate_webhook_secret() {
    openssl rand -hex 32
}

echo "Generating encryption keys..."
echo ""

# Generate keys
WILL_BACKUP_KEY=$(generate_key)
DOCUMENT_KEY=$(generate_key)
GUARDIAN_KEY=$(generate_key)
WEBHOOK_SECRET=$(generate_webhook_secret)

# Display the generated keys
echo "# ===================="
echo "# GENERATED ENCRYPTION KEYS"
echo "# ===================="
echo ""
echo "# Primary encryption key for will backups"
echo "WILL_BACKUP_ENCRYPTION_KEY=$WILL_BACKUP_KEY"
echo ""
echo "# Document encryption key"
echo "DOCUMENT_ENCRYPTION_KEY=$DOCUMENT_KEY"
echo ""
echo "# Guardian data encryption key"
echo "GUARDIAN_DATA_ENCRYPTION_KEY=$GUARDIAN_KEY"
echo ""
echo "# Legal validation webhook secret"
echo "LEGAL_VALIDATION_WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""
echo "# ===================="
echo ""

# Optional: Save to a secure file
read -p "Would you like to save these keys to a secure file? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    FILENAME=".env.keys.$TIMESTAMP"
    
    cat > "$FILENAME" << EOF
# Generated encryption keys for LegacyGuard Heritage Vault
# Generated on: $(date)
# IMPORTANT: Store this file securely and delete after copying to your secure key management system

WILL_BACKUP_ENCRYPTION_KEY=$WILL_BACKUP_KEY
DOCUMENT_ENCRYPTION_KEY=$DOCUMENT_KEY
GUARDIAN_DATA_ENCRYPTION_KEY=$GUARDIAN_KEY
LEGAL_VALIDATION_WEBHOOK_SECRET=$WEBHOOK_SECRET
EOF
    
    # Set restrictive permissions
    chmod 600 "$FILENAME"
    
    echo "✅ Keys saved to: $FILENAME"
    echo "⚠️  IMPORTANT: This file contains sensitive keys. Please:"
    echo "   1. Copy these keys to your secure key management system"
    echo "   2. Delete this file after securing the keys"
    echo "   3. Never commit this file to version control"
fi

echo ""
echo "🔒 Key generation complete!"
echo ""
echo "Next steps:"
echo "1. Copy these keys to your .env.production file"
echo "2. Store a backup in your secure key management system (e.g., AWS Secrets Manager, HashiCorp Vault)"
echo "3. Ensure your deployment process securely injects these environment variables"
echo ""
