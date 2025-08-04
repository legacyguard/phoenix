#!/bin/bash

# Script to generate new encryption keys for existing LegacyGuard project

echo "🔐 Generating new encryption keys for existing project..."
echo ""

# Generate encryption key for will backups
WILL_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)

echo "Generated keys:"
echo "==============="
echo ""
echo "WILL_ENCRYPTION_KEY=$WILL_ENCRYPTION_KEY"
echo ""
echo "LEGAL_VALIDATION_WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""
echo "Copy these values to your .env file"
