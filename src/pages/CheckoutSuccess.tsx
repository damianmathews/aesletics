import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { updateProfile } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      console.log('🎉 Checkout success! Loading subscription data...');

      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!auth.currentUser) {
        console.error('❌ No user found');
        setError(true);
        return;
      }

      try {
        // Try to load subscription data from Firestore (webhook should have created it)
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts} to load subscription...`);

          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📦 User data:', userData);

            if (userData.subscription && (userData.subscription.status === 'trialing' || userData.subscription.status === 'active')) {
              console.log('✅ Subscription found!', userData.subscription);

              // Update profile with subscription
              updateProfile({
                subscription: userData.subscription,
              });

              setLoading(false);

              // Redirect to dashboard after a moment
              setTimeout(() => {
                navigate('/app', { replace: true });
              }, 2000);

              return;
            }
          }

          attempts++;
          if (attempts < maxAttempts) {
            // Wait before next attempt (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }

        // If we get here, we couldn't find the subscription
        console.error('❌ Could not find subscription after', maxAttempts, 'attempts');
        setError(true);
      } catch (error) {
        console.error('❌ Error loading subscription:', error);
        setError(true);
      }
    };

    loadSubscription();
  }, [navigate, updateProfile]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-md w-full border text-center"
          style={{ borderColor: 'var(--color-error)' }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Processing Delayed
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Your payment is processing. This can take a few moments. Please check your subscription status in Settings.
          </p>
          <button
            onClick={() => navigate('/app/settings')}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:scale-105"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            Go to Settings
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-md w-full border text-center"
          style={{ borderColor: 'var(--color-accent)' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Loader size={64} style={{ color: 'var(--color-accent)' }} />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Activating Your Trial...
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Just a moment while we set everything up
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 max-w-md w-full border text-center"
        style={{ borderColor: 'var(--color-accent)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
        >
          <CheckCircle size={40} style={{ color: '#22c55e' }} />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Welcome to IRLXP Pro!
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Your 7-day free trial has started. Time to build the life you respect.
        </p>
        <div className="text-xs font-mono py-2 px-4 rounded inline-block" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', color: 'var(--color-accent)' }}>
          Redirecting to dashboard...
        </div>
      </motion.div>
    </div>
  );
}
