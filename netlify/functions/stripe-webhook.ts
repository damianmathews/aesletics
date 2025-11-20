import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  console.log('🔥 Initializing Firebase Admin with project:', process.env.FIREBASE_PROJECT_ID);
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'irlxp-49c3c',
  });
}

const db = getFirestore();

export const handler: Handler = async (event: HandlerEvent) => {
  console.log('📨 Webhook received:', event.httpMethod);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];

  if (!sig) {
    console.error('❌ No stripe-signature header');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No signature' }),
    };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Webhook signature verified. Event type:', stripeEvent.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUserId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log('💳 Checkout session completed:', {
          userId,
          customerId,
          subscriptionId,
          metadata: session.metadata
        });

        if (userId) {
          console.log(`📝 Writing subscription to Firestore for user ${userId}...`);

          // Update user document with subscription info
          await db.collection('users').doc(userId).set(
            {
              subscription: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status: 'trialing',
              },
            },
            { merge: true }
          );

          console.log(`✅ Checkout completed and saved for user ${userId}`);
        } else {
          console.error('❌ No userId in session metadata!');
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.firebaseUserId;

        console.log(`📋 Subscription ${stripeEvent.type}:`, {
          userId,
          subscriptionId: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata
        });

        if (userId) {
          console.log(`📝 Updating subscription in Firestore for user ${userId}...`);

          const subscriptionData = {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          };

          await db.collection('users').doc(userId).set(
            { subscription: subscriptionData },
            { merge: true }
          );

          console.log(`✅ Subscription ${subscription.status} saved for user ${userId}`);
        } else {
          console.error('❌ No userId in subscription metadata!');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.firebaseUserId;

        if (userId) {
          await db.collection('users').doc(userId).set(
            {
              subscription: {
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                status: 'canceled',
                currentPeriodEnd: null,
                trialEnd: null,
                cancelAtPeriodEnd: false,
              },
            },
            { merge: true }
          );

          console.log(`✅ Subscription canceled for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.firebaseUserId;

          if (userId) {
            await db.collection('users').doc(userId).set(
              {
                subscription: {
                  status: 'past_due',
                },
              },
              { merge: true }
            );

            console.log(`⚠️ Payment failed for user ${userId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
