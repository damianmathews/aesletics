import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';

interface QuestConfirmDialogProps {
  isOpen: boolean;
  questTitle: string;
  xpAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function QuestConfirmDialog({
  isOpen,
  questTitle,
  xpAmount,
  onConfirm,
  onCancel,
}: QuestConfirmDialogProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = () => {
    if (isChecked) {
      onConfirm();
      setIsChecked(false); // Reset for next time
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="glass rounded-lg p-6 md:p-8 border max-w-md w-full shadow-2xl"
              style={{ borderColor: 'var(--color-accent)' }}
            >
              {/* Title */}
              <h2
                className="font-display text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Confirm Completion
              </h2>

              {/* Quest Name */}
              <p
                className="text-base mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {questTitle}
              </p>

              {/* Warning Box */}
              <div
                className="mb-5 p-4 rounded-lg border"
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  borderColor: 'rgba(251, 191, 36, 0.3)',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--color-warning)' }}
                  />
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    False completions violate community standards and undermine your own progress.
                  </p>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-6 h-6 rounded border-2 transition-all peer-checked:border-green-500 peer-checked:bg-green-500 flex items-center justify-center"
                    style={{
                      borderColor: isChecked ? 'var(--color-success)' : 'var(--color-border)',
                    }}
                  >
                    {isChecked && <Check size={16} color="white" strokeWidth={3} />}
                  </div>
                </div>
                <span
                  className="text-base leading-relaxed select-none group-hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-text)' }}
                >
                  I confirm I have honestly completed this quest
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isChecked}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                  style={{
                    background: isChecked ? 'var(--gradient-primary)' : 'rgba(167, 139, 250, 0.2)',
                    color: 'white',
                  }}
                >
                  Complete +{xpAmount} XP
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
