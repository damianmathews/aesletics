import { useStore } from '../store/useStore';
import { isSubscriptionActive, isInTrial, getTrialDaysRemaining } from '../lib/subscription';

/**
 * Hook to easily access subscription status throughout the app
 */
export function useSubscription() {
  const subscription = useStore((state) => state.profile.subscription);

  return {
    subscription,
    isActive: isSubscriptionActive(subscription),
    isTrialing: isInTrial(subscription),
    trialDaysRemaining: getTrialDaysRemaining(subscription),
    hasAccess: isSubscriptionActive(subscription),
  };
}
