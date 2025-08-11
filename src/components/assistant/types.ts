export interface AssistantMessage {
  type: "welcome" | "guidance" | "encouragement" | "celebration" | "support";
  content: string;
  icon?: React.ElementType;
  actionSuggestion?: {
    text: string;
    action: () => void;
    priority: "low" | "medium" | "high";
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  priority: "high" | "medium" | "low";
  familyBenefit: string;
  action: () => void;
  icon?: React.ElementType;
}
