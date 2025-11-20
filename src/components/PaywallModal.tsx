import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, Target, Users, Zap, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../lib/subscription';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // What feature they tried to access
}

export default function PaywallModal({ isOpen, onClose, feature }: PaywallModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    if (!user || !user.email) {
      setError('Please log in to start your trial');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting trial for user:', user.uid, user.email);
      await createCheckoutSession(user.uid, user.email);
      // User will be redirected to Stripe Checkout
    } catch (err: any) {
      console.error('❌ Failed to start trial:', err);
      const errorMessage = err.message || 'Failed to start trial. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Target size={20} />,
      text: 'Complete quests & earn XP',
    },
    {
      icon: <Trophy size={20} />,
      text: 'Climb the global leaderboard',
    },
    {
      icon: <TrendingUp size={20} />,
      text: 'Track progress & build streaks',
    },
    {
      icon: <Users size={20} />,
      text: 'Join quest packs & challenges',
    },
    {
      icon: <Zap size={20} />,
      text: 'Unlock achievements & badges',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={onClose}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
            className="relative glass rounded-2xl p-8 max-w-md w-full border"
            style={{ borderColor: 'var(--color-accent)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Trophy size={32} color="white" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-center mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              {feature ? `Unlock ${feature}` : 'Unlock Your Full Potential'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Start your 7-day free trial to access all features
            </motion.p>

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', color: 'var(--color-accent)' }}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full py-4 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Loading...
                </span>
              ) : (
                'Start 7-Day Free Trial'
              )}
            </motion.button>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center mb-3"
              >
                {error}
              </motion.div>
            )}

            {/* Pricing info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-center text-xs mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Then $4.99/month. Cancel anytime, no questions asked.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-4 pt-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <Check size={14} style={{ color: 'var(--color-accent)' }} />
                Cancel anytime
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <Check size={14} style={{ color: 'var(--color-accent)' }} />
                Secure by Stripe
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
