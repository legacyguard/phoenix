import { createContext } from "react";
import type {
  AssistantMessage,
  Recommendation,
} from "@/components/assistant/PersonalAssistant";

export type EmotionalState =
  | "starting"
  | "overwhelmed"
  | "progressing"
  | "accomplished";

export interface UserProgress {
  totalActions: number;
  completedAreas: string[];
  currentStreak: number;
  lastActivity: Date | null;
  assetsCount: number;
  documentsCount: number;
  trustedPeopleCount: number;
  willCompleted: boolean;
}

export interface AssistantContextType {
  currentContext: string;
  userProgress: UserProgress;
  emotionalState: EmotionalState;
  updateContext: (context: string) => void;
  trackProgress: (action: string, area?: string) => void;
  getPersonalizedMessage: () => AssistantMessage;
  getSuggestions: () => Recommendation[];
}

export const AssistantContext = createContext<AssistantContextType | undefined>(
  undefined,
);
