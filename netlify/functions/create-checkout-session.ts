import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, userEmail } = JSON.parse(event.body || '{}');

    console.log('📋 Checkout session request:', { userId, userEmail });

    if (!userId || !userEmail) {
      console.error('❌ Missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Check for required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Stripe is not configured properly. Please contact support.' }),
      };
    }

    if (!process.env.STRIPE_PRICE_ID) {
      console.error('❌ STRIPE_PRICE_ID not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Stripe price ID is not configured. Please contact support.' }),
      };
    }

    console.log('🔍 Looking for existing customer...');

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
      console.log('✅ Found existing customer:', customer.id);
    } else {
      console.log('➕ Creating new customer...');
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
        },
      });
      console.log('✅ Created new customer:', customer.id);
    }

    console.log('🛒 Creating checkout session...');
    console.log('💳 Using price ID:', process.env.STRIPE_PRICE_ID);

    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          firebaseUserId: userId,
        },
      },
      success_url: `${process.env.URL || 'https://irlxp.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://irlxp.app'}/app/quests`,
      custom_text: {
        submit: {
          message: 'Start your 7-day free trial with IRLXP',
        },
      },
      metadata: {
        firebaseUserId: userId,
      },
    });

    console.log('✅ Checkout session created:', session.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'unknown_error'
      }),
    };
  }
};
