import type { Subscription } from '../types';

/**
 * Check if user has an active subscription (including trial)
 */
export function isSubscriptionActive(subscription?: Subscription): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Check if user is currently in trial period
 */
export function isInTrial(subscription?: Subscription): boolean {
  if (!subscription) return false;
  return subscription.status === 'trialing';
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription?: Subscription): number | null {
  if (!subscription?.trialEnd) return null;

  const trialEnd = new Date(subscription.trialEnd);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Create a checkout session and redirect to Stripe
 */
export async function createCheckoutSession(userId: string, userEmail: string): Promise<void> {
  try {
    console.log('📤 Sending checkout session request...');
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Checkout session failed:', data);
      throw new Error(data.error || 'Failed to create checkout session');
    }

    if (!data.url) {
      console.error('❌ No checkout URL returned:', data);
      throw new Error('No checkout URL received from server');
    }

    console.log('✅ Checkout session created, redirecting to Stripe...');

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to start trial');
  }
}

/**
 * Open Stripe Customer Portal for managing subscription
 */
export async function openCustomerPortal(customerId: string): Promise<void> {
  try {
    const response = await fetch('/.netlify/functions/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Customer Portal
    window.location.href = url;
  } catch (error) {
    console.error('Error opening customer portal:', error);
    throw error;
  }
}

/**
 * Format subscription status for display
 */
export function getSubscriptionStatusText(subscription?: Subscription): string {
  if (!subscription) return 'No subscription';

  switch (subscription.status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Free Trial';
    case 'canceled':
      return 'Canceled';
    case 'past_due':
      return 'Payment Failed';
    case 'unpaid':
      return 'Unpaid';
    default:
      return 'No subscription';
  }
}

/**
 * Get user-friendly message based on subscription status
 */
export function getSubscriptionMessage(subscription?: Subscription): string {
  if (!subscription) {
    return 'Start your free trial to unlock all features';
  }

  const daysRemaining = getTrialDaysRemaining(subscription);

  if (subscription.status === 'trialing' && daysRemaining !== null) {
    if (daysRemaining === 0) {
      return 'Your trial ends today';
    } else if (daysRemaining === 1) {
      return '1 day left in your free trial';
    } else {
      return `${daysRemaining} days left in your free trial`;
    }
  }

  if (subscription.status === 'active') {
    if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
      const endDate = new Date(subscription.currentPeriodEnd);
      return `Access until ${endDate.toLocaleDateString()}`;
    }
    return 'Full access to all features';
  }

  if (subscription.status === 'past_due') {
    return 'Please update your payment method';
  }

  if (subscription.status === 'canceled') {
    return 'Subscription canceled - Reactivate to continue';
  }

  return 'Start your free trial';
}
