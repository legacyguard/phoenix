import { useContext } from "react";
import { GrowthBookContext } from "@/contexts/GrowthBookContext";

export const useGrowthBook = () => {
  const context = useContext(GrowthBookContext);
  if (!context) {
    throw new Error("useGrowthBook must be used within a GrowthBookProvider");
  }
  return context;
};
