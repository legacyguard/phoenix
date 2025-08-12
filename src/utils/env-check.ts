/**
 * Environment configuration checker
 * Helps ensure proper configuration for development vs production
 */
import { logger } from "@/utils/logger";

export const isProduction = import.meta.env.PROD;
export const isDevelopment = (import.meta.env.DEV || import.meta.env.VITE_E2E);

/**
 * Check if Clerk is using development keys
 */
export const isClerkDevelopment = (): boolean => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return publishableKey?.startsWith("pk_test_") ?? false;
};

/**
 * Check if Clerk is using production keys
 */
export const isClerkProduction = (): boolean => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return publishableKey?.startsWith("pk_live_") ?? false;
};

/**
 * Environment configuration warnings
 */
export const getEnvironmentWarnings = (): string[] => {
  const warnings: string[] = [];

  // Check Clerk configuration
  if (isProduction && isClerkDevelopment()) {
    warnings.push(
      "⚠️ Production build is using Clerk development keys. Please update to production keys.",
    );
  }

  if (!isProduction && isClerkProduction()) {
    warnings.push(
      "ℹ️ Development build is using Clerk production keys. Consider using development keys for testing.",
    );
  }

  // Check Supabase configuration
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    warnings.push("⚠️ Supabase URL is not configured.");
  }

  // Check encryption key
  const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!encryptionKey) {
    warnings.push(
      "⚠️ Encryption key is not configured. Some features may not work properly.",
    );
  }

  // Check Stripe configuration for production
  if (isProduction) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey || stripeKey.startsWith("pk_test_")) {
      warnings.push(
        "⚠️ Production build needs Stripe production keys for payment processing.",
      );
    }
  }

  return warnings;
};

/**
 * Log environment configuration on app startup
 */
export const logEnvironmentInfo = (): void => {
  if (isDevelopment) {
    logger.group("🔧 Environment Configuration");
    logger.info("Mode:", isProduction ? "Production" : "Development");
    logger.info(
      "Clerk:",
      isClerkProduction() ? "Production Keys" : "Development Keys",
    );

    const warnings = getEnvironmentWarnings();
    if (warnings.length > 0) {
      logger.group("⚠️ Configuration Warnings");
      warnings.forEach((warning) => logger.warn(warning));
      logger.groupEnd();
    }

    logger.groupEnd();
  }
};
