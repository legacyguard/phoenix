/**
 * React hook for Professional Progress tracking
 */

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import {
  ProfessionalProgressService,
  ProfessionalProgress,
  SecurityArea,
  Recommendation,
} from "@/services/ProfessionalProgressService";

export interface UseProfessionalProgressReturn {
  progress: ProfessionalProgress | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  markAreaReviewed: (areaId: string) => Promise<void>;
  updateAreaStatus: (
    areaId: string,
    status: SecurityArea["status"],
  ) => Promise<void>;
  getNextAction: () => Recommendation | null;
  needsAttention: boolean;
  completionPercentage: number;
}

/**
 * Hook for accessing professional progress data
 */
export function useProfessionalProgress(): UseProfessionalProgressReturn {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [needsAttention, setNeedsAttention] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch progress data
  const {
    data: progress,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["professional-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      return ProfessionalProgressService.getProfessionalProgress(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update calculated values when progress changes
  useEffect(() => {
    if (progress) {
      setNeedsAttention(
        ProfessionalProgressService.needsImmediateAttention(progress.metrics),
      );
      setCompletionPercentage(
        ProfessionalProgressService.getCompletionPercentage(progress.metrics),
      );
    }
  }, [progress]);

  // Mark area as reviewed
  const markAreaReviewedMutation = useMutation({
    mutationFn: async (areaId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      await ProfessionalProgressService.markAreaReviewed(user.id, areaId);
    },
    onSuccess: (_, areaId) => {
      queryClient.invalidateQueries(["professional-progress", user?.id]);
      toast({
        title: "Area Marked as Reviewed",
        description: "The security area has been marked as reviewed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark area as reviewed. Please try again.",
        variant: "destructive",
      });
      console.error("Error marking area as reviewed:", error);
    },
  });

  // Update area status
  const updateAreaStatusMutation = useMutation({
    mutationFn: async ({
      areaId,
      status,
    }: {
      areaId: string;
      status: SecurityArea["status"];
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      await ProfessionalProgressService.updateAreaStatus(
        user.id,
        areaId,
        status,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional-progress", user?.id]);
      toast({
        title: "Status Updated",
        description: "The security area status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update area status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating area status:", error);
    },
  });

  // Callback to mark area as reviewed
  const markAreaReviewed = useCallback(
    async (areaId: string) => {
      await markAreaReviewedMutation.mutateAsync(areaId);
    },
    [markAreaReviewedMutation],
  );

  // Callback to update area status
  const updateAreaStatus = useCallback(
    async (areaId: string, status: SecurityArea["status"]) => {
      await updateAreaStatusMutation.mutateAsync({ areaId, status });
    },
    [updateAreaStatusMutation],
  );

  // Get next priority action
  const getNextAction = useCallback((): Recommendation | null => {
    if (!progress) return null;
    return ProfessionalProgressService.getNextPriorityAction(
      progress.recommendations,
    );
  }, [progress]);

  return {
    progress,
    isLoading,
    error: error as Error | null,
    refetch,
    markAreaReviewed,
    updateAreaStatus,
    getNextAction,
    needsAttention,
    completionPercentage,
  };
}

/**
 * Hook for accessing specific security area data
 */
export function useSecurityArea(areaId: string) {
  const { progress } = useProfessionalProgress();

  const area = progress?.securityAreas.find((a) => a.id === areaId) || null;
  const subtaskProgress = area?.subtasks
    ? {
        total: area.subtasks.length,
        completed: area.subtasks.filter((s) => s.completed).length,
        required: area.subtasks.filter((s) => s.required && !s.completed)
          .length,
      }
    : null;

  return {
    area,
    subtaskProgress,
    isComplete: area?.status === "complete",
    needsReview: area?.reviewNeeded || false,
  };
}

/**
 * Hook for accessing recommendations
 */
export function useRecommendations(
  filterPriority?: "urgent" | "high" | "medium" | "low",
) {
  const { progress } = useProfessionalProgress();

  const recommendations = progress?.recommendations || [];
  const filtered = filterPriority
    ? recommendations.filter((r) => r.priority === filterPriority)
    : recommendations;

  const urgentCount = recommendations.filter(
    (r) => r.priority === "urgent",
  ).length;
  const highCount = recommendations.filter((r) => r.priority === "high").length;

  return {
    recommendations: filtered,
    urgentCount,
    highCount,
    totalCount: recommendations.length,
    hasUrgent: urgentCount > 0,
  };
}

/**
 * Hook for activity timeline
 */
export function useActivityTimeline(limit?: number) {
  const { progress } = useProfessionalProgress();

  const timeline = progress?.timeline || [];
  const limited = limit ? timeline.slice(0, limit) : timeline;

  const todayEvents = timeline.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const thisWeekEvents = timeline.filter((event) => {
    const eventDate = new Date(event.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return eventDate >= weekAgo;
  });

  return {
    timeline: limited,
    todayCount: todayEvents.length,
    weekCount: thisWeekEvents.length,
    totalCount: timeline.length,
  };
}

/**
 * Hook for readiness level information
 */
export function useReadinessLevel() {
  const { progress } = useProfessionalProgress();

  const readinessLevel = progress?.readinessLevel || null;
  const isFullySecured = readinessLevel?.level === "maintained";
  const needsWork =
    readinessLevel?.level === "initial" ||
    readinessLevel?.level === "developing";

  return {
    readinessLevel,
    isFullySecured,
    needsWork,
    progressLabel: readinessLevel?.label || "Not Started",
    progressDescription:
      readinessLevel?.description || "Begin securing your family's future",
  };
}
