import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body || '{}');

    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing sessionId' }),
      };
    }

    console.log('🔄 Syncing subscription for session:', sessionId);

    // Fetch the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session.subscription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No subscription found' }),
      };
    }

    const subscription = session.subscription as Stripe.Subscription;

    console.log('✅ Subscription fetched:', {
      id: subscription.id,
      status: subscription.status,
    });

    // Return subscription data to frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        subscription: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      }),
    };
  } catch (error: any) {
    console.error('❌ Error syncing subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
