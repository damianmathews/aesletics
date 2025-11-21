// Feature flags for easy testing and development

/**
 * Check if paywall should be bypassed for testing
 * Set VITE_BYPASS_PAYWALL=true in .env.local to disable paywall
 */
export const isPaywallBypassed = (): boolean => {
  return import.meta.env.VITE_BYPASS_PAYWALL === 'true';
};

/**
 * Check if user has active subscription OR paywall is bypassed
 */
export const hasAccess = (subscriptionStatus?: string): boolean => {
  if (isPaywallBypassed()) {
    console.log('🚧 Paywall bypassed for testing');
    return true;
  }

  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
};
