'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuickCheck as QuickCheckType } from '@/types/topic';

interface QuickCheckProps {
  check: QuickCheckType;
}

export default function QuickCheck({ check }: QuickCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const isCorrect = selected === check.correctIndex;

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
  };

  const borderColor = !answered
    ? '#E5E5E3'
    : isCorrect
      ? '#16A34A'
      : '#F59E0B';

  return (
    <motion.div
      className="rounded-2xl overflow-hidden transition-colors"
      style={{
        background: '#F5F4F1',
        border: `1.5px solid ${borderColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
      animate={{ borderColor }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-5 pt-4 pb-1">
        <span className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
          💡 Quick Check
        </span>
      </div>

      <div className="px-5 pb-2">
        <p className="text-sm font-medium leading-relaxed" style={{ color: '#1A1A1A' }}>
          {check.question}
        </p>
      </div>

      {/* Two pill buttons */}
      <div className="px-5 pb-4 flex gap-3">
        {check.options.map((option, i) => {
          let bg = '#FFFFFF';
          let border = '#E5E5E3';
          let textColor = '#374151';

          if (answered) {
            if (i === check.correctIndex) {
              bg = 'rgba(22,163,74,0.06)';
              border = '#16A34A';
              textColor = '#16A34A';
            } else if (i === selected) {
              bg = 'rgba(245,158,11,0.06)';
              border = '#F59E0B';
              textColor = '#B45309';
            }
          } else if (i === selected) {
            border = '#6366F1';
            bg = 'rgba(99,102,241,0.04)';
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color: textColor,
              }}
              whileHover={answered ? {} : { scale: 1.02 }}
              whileTap={answered ? {} : { scale: 0.98 }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mx-5 mb-4 p-3.5 rounded-xl"
              style={{
                background: isCorrect ? '#F0FDF4' : '#FFFBEB',
                border: `1px solid ${isCorrect ? '#BBF7D0' : '#FDE68A'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{isCorrect ? '✅' : '💡'}</span>
                <span
                  className="font-mono text-[0.6rem] uppercase tracking-wider font-semibold"
                  style={{ color: isCorrect ? '#16A34A' : '#B45309' }}
                >
                  {isCorrect ? 'Correct!' : `Answer: ${check.options[check.correctIndex]}`}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                {check.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
