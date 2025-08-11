import React, { createContext } from 'react';
import type { SubscriptionStatus } from '@/services/stripeService';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  isPremium: boolean;
  checkAccess: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined); 