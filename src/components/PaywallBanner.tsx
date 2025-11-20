import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import { useState } from 'react';
import PaywallModal from './PaywallModal';
import { useSubscription } from '../hooks/useSubscription';

export default function PaywallBanner() {
  const { hasAccess } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  // Don't show banner if user has access
  if (hasAccess) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-4 border mb-6"
        style={{
          borderColor: 'var(--color-accent)',
          backgroundColor: 'rgba(167, 139, 250, 0.1)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Crown size={20} color="white" />
            </div>
            <div>
              <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                Unlock Full Access
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Complete quests, track progress, and climb the leaderboard
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            <Lock size={16} />
            Start Free Trial
          </button>
        </div>
      </motion.div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Premium Features"
      />
    </>
  );
}
