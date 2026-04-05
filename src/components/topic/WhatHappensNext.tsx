'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WhatHappensNextExercise } from '@/types/topic';

interface WhatHappensNextProps {
  exercise: WhatHappensNextExercise;
  onComplete?: (score: number) => void;
}

/* ── tiny confetti particles ── */
function ConfettiParticles() {
  const colors = ['#FF5A1F', '#16A34A', '#FBBF24', '#6366F1', '#EC4899'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const color = colors[i % colors.length];
        const size = 4 + Math.random() * 5;
        return (
          <motion.div
            key={i}
            initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
            animate={{
              y: [0, -(80 + Math.random() * 120), 200],
              x: [0, (Math.random() - 0.5) * 120],
              opacity: [1, 1, 0],
              scale: [1, 1.2, 0.6],
              rotate: [0, Math.random() * 360],
            }}
            transition={{ duration: 1.2, delay, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: '50%',
              width: size,
              height: size,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── main component ── */
export default function WhatHappensNext({ exercise, onComplete }: WhatHappensNextProps) {
  const { steps } = exercise;
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = steps[currentStep] as (typeof steps)[number] | undefined;

  /* reset confetti after animation */
  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 1400);
    return () => clearTimeout(t);
  }, [showConfetti]);

  /* handle option pick */
  const handlePick = useCallback(
    (idx: number) => {
      if (status === 'correct' || !step) return;
      setSelectedIndex(idx);

      const picked = step.options[idx];
      if (picked.isCorrect) {
        const isFirst = status === 'idle'; // first attempt
        setStatus('correct');
        setShowExplanation(true);
        setShowConfetti(true);
        setCorrectCount((c) => c + 1);
        if (isFirst) setFirstTryCorrect((c) => c + 1);
      } else {
        setStatus('wrong');
      }
    },
    [status, step],
  );

  /* advance to next step */
  const handleNext = useCallback(() => {
    const next = currentStep + 1;
    if (next >= totalSteps) {
      setFinished(true);
      const xp = firstTryCorrect * 20 + (correctCount - firstTryCorrect) * 5;
      onComplete?.(xp);
      return;
    }
    setCurrentStep(next);
    setSelectedIndex(null);
    setStatus('idle');
    setShowExplanation(false);
  }, [currentStep, totalSteps, firstTryCorrect, correctCount, onComplete]);

  /* ── finished celebration ── */
  if (finished) {
    const xp = firstTryCorrect * 20 + (correctCount - firstTryCorrect) * 5;
    return (
      <div>
        <SectionHeader />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl text-center py-14 px-6 relative overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E5E3',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <ConfettiParticles />
          <motion.span
            className="text-5xl block mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.5 }}
          >
            🎉
          </motion.span>
          <h4 className="font-semibold text-lg mb-1" style={{ color: '#1A1A1A' }}>
            All done!
          </h4>
          <p className="font-mono text-sm mb-3" style={{ color: '#6B7280' }}>
            {correctCount}/{totalSteps} correct
          </p>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-4 py-2 rounded-full font-mono text-sm font-semibold"
            style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}
          >
            +{xp} XP
          </motion.span>
        </motion.div>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div>
      <SectionHeader />

      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E5E3',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {/* confetti layer */}
        <AnimatePresence>{showConfetti && <ConfettiParticles />}</AnimatePresence>

        <div className="p-6">
          {/* code line */}
          <pre
            className="p-4 rounded-xl overflow-x-auto font-mono text-[0.8rem] leading-6 mb-5"
            style={{
              background: '#1E1E2E',
              border: '1px solid #313145',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#E2E8F0',
            }}
          >
            {step.codeLine}
          </pre>

          {/* question */}
          <p className="text-sm font-medium mb-4" style={{ color: '#1A1A1A' }}>
            {step.question}
          </p>

          {/* options */}
          <div className="space-y-3">
            {step.options.map((opt, i) => {
              const isSelected = selectedIndex === i;
              const isCorrectOption = opt.isCorrect;

              let borderColor = '#E5E5E3';
              let bg = '#FAFAF8';
              let textColor = '#374151';

              if (status === 'correct' && isCorrectOption) {
                borderColor = '#16A34A';
                bg = 'rgba(22,163,74,0.06)';
                textColor = '#16A34A';
              } else if (status === 'wrong' && isSelected) {
                borderColor = '#DC2626';
                bg = 'rgba(220,38,38,0.04)';
                textColor = '#DC2626';
              } else if (isSelected && status === 'idle') {
                borderColor = '#FF5A1F';
                bg = 'rgba(255,90,31,0.04)';
                textColor = '#1A1A1A';
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handlePick(i)}
                  disabled={status === 'correct'}
                  className="w-full text-left py-4 px-6 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 disabled:cursor-default"
                  style={{ border: `1px solid ${borderColor}`, background: bg, color: textColor }}
                  whileHover={status === 'correct' ? {} : { scale: 1.01 }}
                  whileTap={status === 'correct' ? {} : { scale: 0.99 }}
                  animate={
                    status === 'wrong' && isSelected
                      ? { x: [0, -6, 6, -4, 4, 0] }
                      : status === 'correct' && isCorrectOption
                        ? { scale: [1, 1.03, 1] }
                        : {}
                  }
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-lg flex-shrink-0">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* wrong hint */}
          <AnimatePresence>
            {status === 'wrong' && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs font-mono"
                style={{ color: '#DC2626' }}
              >
                Not quite — try again!
              </motion.p>
            )}
          </AnimatePresence>

          {/* explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
                >
                  <span
                    className="font-mono text-[0.65rem] uppercase tracking-wider block mb-2"
                    style={{ color: '#16A34A' }}
                  >
                    Explanation
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    {step.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* next button */}
          <AnimatePresence>
            {status === 'correct' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs font-medium transition-all"
                  style={{
                    color: '#FF5A1F',
                    background: 'rgba(255,90,31,0.06)',
                    border: '1px solid rgba(255,90,31,0.15)',
                  }}
                >
                  {currentStep + 1 < totalSteps ? 'Next Step' : 'See Results'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* step progress dots */}
        <div className="flex justify-center gap-2 pb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === currentStep ? 20 : 8,
                height: 8,
                background:
                  i < currentStep
                    ? '#16A34A'
                    : i === currentStep
                      ? '#FF5A1F'
                      : '#E5E5E3',
                borderRadius: 999,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── section header (extracted to keep render clean) ── */
function SectionHeader() {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="text-lg">🎮</span>
      <h3 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>
        What Happens Next?
      </h3>
      <span
        className="px-2 py-0.5 rounded-full font-mono text-[0.65rem] uppercase tracking-wider"
        style={{
          background: 'rgba(255,90,31,0.06)',
          color: '#FF5A1F',
          border: '1px solid rgba(255,90,31,0.15)',
        }}
      >
        Interactive
      </span>
    </div>
  );
}
