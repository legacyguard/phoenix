import { PLAN_LIMITS, MAX_FILE_SIZES } from "./constants";
import { Tables } from "@/integrations/supabase/types";

type PlanType = Tables<"user_subscriptions">["plan_type"];

/**
 * Check if a user can add more guardians based on their plan
 */
export function canAddGuardian(
  currentGuardianCount: number,
  plan: PlanType,
): boolean {
  const limit = PLAN_LIMITS[plan].guardians;
  // -1 means unlimited
  if (limit === -1) return true;
  return currentGuardianCount < limit;
}

/**
 * Get remaining guardian slots for a plan
 */
export function getRemainingGuardianSlots(
  currentGuardianCount: number,
  plan: PlanType,
): number | null {
  const limit = PLAN_LIMITS[plan].guardians;
  // -1 means unlimited, return null
  if (limit === -1) return null;
  return Math.max(0, limit - currentGuardianCount);
}

/**
 * Check if a file size is within the plan's limit
 */
export function isFileSizeAllowed(fileSize: number, plan: PlanType): boolean {
  const maxSize = MAX_FILE_SIZES[plan];
  return fileSize <= maxSize;
}

/**
 * Check if adding a file would exceed storage limit
 */
export function canAddFile(
  currentStorageUsed: number,
  fileSize: number,
  plan: PlanType,
): boolean {
  const storageLimit = PLAN_LIMITS[plan].storage;
  return currentStorageUsed + fileSize <= storageLimit;
}

/**
 * Get remaining storage in bytes
 */
export function getRemainingStorage(
  currentStorageUsed: number,
  plan: PlanType,
): number {
  const storageLimit = PLAN_LIMITS[plan].storage;
  return Math.max(0, storageLimit - currentStorageUsed);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get plan limits in a human-readable format
 */
export function getPlanLimitsDisplay(plan: PlanType) {
  const limits = PLAN_LIMITS[plan];
  return {
    storage: formatBytes(limits.storage),
    guardians:
      limits.guardians === -1 ? "Unlimited" : limits.guardians.toString(),
    maxFileSize: formatBytes(MAX_FILE_SIZES[plan]),
    features: limits.features,
  };
}
