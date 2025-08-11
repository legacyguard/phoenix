import { registerRoutePrefetch } from './prefetch';

// Príklady – nahraď reálnymi lazy importmi:
registerRoutePrefetch('/dashboard', () => import('../components/dashboard/Dashboard'));
registerRoutePrefetch('/analytics', () => import('../components/analytics/AnalyticsDashboard'));
registerRoutePrefetch('/settings', () => import('../features/settings/SettingsPage'));
