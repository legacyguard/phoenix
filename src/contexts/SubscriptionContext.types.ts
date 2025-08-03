import { SubscriptionStatus } from '@/services/stripeService';

export interface SubscriptionContextValue {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  isPremium: boolean;
  checkAccess: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
}
