'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface XPToastProps {
  amount: number;
  visible: boolean;
}

export default function XPToast({ amount, visible }: XPToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, y: 0, opacity: 0 }}
          animate={{ scale: 1, y: -30, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="inline-flex items-center px-3 py-1.5 rounded-full pointer-events-none"
          style={{
            background: 'rgba(255,90,31,0.1)',
            border: '1px solid rgba(255,90,31,0.25)',
          }}
        >
          <span
            className="font-mono text-sm font-bold"
            style={{ color: '#FF5A1F' }}
          >
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
