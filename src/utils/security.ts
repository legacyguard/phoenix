/**
 * Security utilities for the application
 */

import { logger } from '@/utils/logger';

const AUTH_STORAGE_KEY = 'legacyguard_auth';

/**
 * Clear any existing authentication data from localStorage
 * This ensures the password wall is always shown first
 */
export function clearAuthenticationData(): void {
  try {
    // Clear any existing authentication data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    
    // Also clear any other potential auth-related data
    const keysToRemove = [
      'legacyguard_auth',
      'auth_token',
      'user_session',
      'app_authenticated'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    logger.info('Security: Cleared all authentication data');
  } catch (error) {
    logger.warn('Security: Could not clear authentication data:', error);
  }
}

/**
 * Check if the application is running in a development environment
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
}

/**
 * Check if the application is running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
}

/**
 * Get the current environment
 */
export function getEnvironment(): string {
  return import.meta.env.MODE || 'development';
}

/**
 * Security check to ensure proper environment configuration
 */
export function validateSecurityConfig(): void {
  // Debug output is managed by the logger via environment variables

  // Always clear authentication data on app start
  clearAuthenticationData();
}