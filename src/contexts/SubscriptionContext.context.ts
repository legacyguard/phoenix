import { createContext } from "react";
import type { SubscriptionContextValue } from "./SubscriptionContext.types";

export const SubscriptionContext = createContext<
  SubscriptionContextValue | undefined
>(undefined);
