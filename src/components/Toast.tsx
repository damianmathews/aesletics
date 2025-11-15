import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  subMessage?: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, subMessage, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-8 right-8 z-50 glass rounded-xl p-6 border shadow-2xl max-w-md"
        style={{ borderColor: 'rgba(167, 139, 250, 0.3)' }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            style={{ color: 'var(--color-accent)' }}
          >
            <CheckCircle size={32} />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {message}
            </h3>
            {subMessage && (
              <p className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {subMessage}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Progress bar */}
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 rounded-full"
          style={{ background: 'var(--gradient-primary)' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
