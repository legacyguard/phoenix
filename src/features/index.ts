// Export all feature components for optimized lazy loading
// Handle both default and named exports

// Dashboard
export { default as Dashboard } from './dashboard/components/Dashboard';

// Assets Vault
export { AssetOverview } from './assets-vault/components/AssetOverview';
export { AssetDetail } from './assets-vault/components/AssetDetail';
export { Vault } from './assets-vault/components/VaultDashboard';

// Subscriptions
export { SubscriptionDashboard } from './subscriptions/components/SubscriptionDashboard';

// Family Circle
export { TrustedCircle } from './family-circle/components/TrustedCircle';
export { FamilyHub } from './family-circle/components/FamilyHub';
