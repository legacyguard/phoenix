import { useContext } from "react";
import { AssistantContext } from "../contexts/AssistantContextType";

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within AssistantProvider");
  }
  return context;
};
