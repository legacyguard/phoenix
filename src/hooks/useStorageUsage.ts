import { useEffect, useState } from "react";
import { supabaseWithRetry } from "@/utils/supabaseWithRetry";
import { useUserPlan } from "./useUserPlan";
import { getRemainingStorage, formatBytes } from "@/utils/planLimits";
import { toast } from "sonner";

interface StorageUsage {
  used: number;
  total: number;
  remaining: number;
  usedFormatted: string;
  totalFormatted: string;
  remainingFormatted: string;
  percentage: number;
}

export function useStorageUsage() {
  const { plan } = useUserPlan();
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStorageUsage() {
      try {
        const {
          data: { user },
        } = await supabaseWithRetry.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get all documents for the user
        const { data: documents, error: documentsError } =
          await supabaseWithRetry
            .from("documents")
            .select("file_size")
            .eq("user_id", user.id);

        if (documentsError) {
          throw documentsError;
        }

        // Calculate total storage used
        const totalUsed =
          documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

        // Get plan storage limit
        const { PLAN_LIMITS } = await import("@/utils/constants");
        const totalStorage = PLAN_LIMITS[plan].storage;
        const remaining = getRemainingStorage(totalUsed, plan);

        setStorageUsage({
          used: totalUsed,
          total: totalStorage,
          remaining,
          usedFormatted: formatBytes(totalUsed),
          totalFormatted: formatBytes(totalStorage),
          remainingFormatted: formatBytes(remaining),
          percentage: Math.min(
            100,
            Math.round((totalUsed / totalStorage) * 100),
          ),
        });
      } catch (err) {
        console.error("Error fetching storage usage:", err);
        setError(err as Error);
        toast.error("Failed to load storage usage");
      } finally {
        setLoading(false);
      }
    }

    fetchStorageUsage();

    // Subscribe to document changes
    const channel = supabaseWithRetry
      .channel("storage-usage-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
        },
        () => {
          fetchStorageUsage();
        },
      )
      .subscribe();

    return () => {
      supabaseWithRetry.removeChannel(channel);
    };
  }, [plan]);

  return { storageUsage, loading, error };
}
