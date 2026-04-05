'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InterviewQuestion as IQ } from '@/types/topic';

interface InterviewQuestionProps {
  question: IQ;
  onViewed?: () => void;
}

export default function InterviewQuestion({ question, onViewed }: InterviewQuestionProps) {
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const revealNextHint = () => {
    if (hintsRevealed < question.hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  const revealAnswer = () => {
    setShowAnswer(true);
    onViewed?.();
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-lg">🎤</span>
        <h3 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>Interview Corner</h3>
        <span
          className="px-2 py-0.5 rounded-full font-mono text-[0.65rem] uppercase tracking-wider"
          style={{ background: 'rgba(99,102,241,0.06)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          Challenge
        </span>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E5E3',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {/* Question */}
        <div className="p-6 pb-4">
          <p
            className="text-sm font-mono mb-1"
            style={{ color: '#9CA3AF' }}
          >
            The interviewer asks:
          </p>
          <p className="text-lg font-medium leading-relaxed" style={{ color: '#1A1A1A' }}>
            &ldquo;{question.question}&rdquo;
          </p>
        </div>

        {/* Hints */}
        <div className="px-6 space-y-2">
          {question.hints.slice(0, hintsRevealed).map((hint, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
              }}
            >
              <span className="font-mono text-[0.65rem] font-bold shrink-0 mt-0.5" style={{ color: '#D97706' }}>
                HINT {i + 1}
              </span>
              <span className="text-sm" style={{ color: '#6B7280' }}>{hint}</span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 p-6 pt-4">
          {hintsRevealed < question.hints.length && (
            <button
              onClick={revealNextHint}
              className="px-4 py-2 rounded-xl font-mono text-xs font-medium transition-all"
              style={{
                color: '#D97706',
                background: 'rgba(217,119,6,0.06)',
                border: '1px solid rgba(217,119,6,0.15)',
              }}
            >
              Hint {hintsRevealed + 1}/{question.hints.length}
            </button>
          )}
          {!showAnswer && (
            <button
              onClick={revealAnswer}
              className="px-4 py-2 rounded-xl font-mono text-xs font-medium transition-all"
              style={{
                color: '#16A34A',
                background: 'rgba(22,163,74,0.06)',
                border: '1px solid rgba(22,163,74,0.15)',
              }}
            >
              Reveal Answer
            </button>
          )}
        </div>

        {/* Answer reveal */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-6 mx-4 mb-4 rounded-xl"
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                }}
              >
                <span className="font-mono text-[0.65rem] uppercase tracking-wider block mb-3" style={{ color: '#16A34A' }}>
                  Model Answer
                </span>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#374151' }}>
                  {question.answer}
                </p>

                {question.followUps.length > 0 && (
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid #E5E5E3' }}>
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider block mb-2.5" style={{ color: '#6366F1' }}>
                      They might follow up with
                    </span>
                    <ul className="space-y-1.5">
                      {question.followUps.map((fu, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#6B7280' }}>
                          <span style={{ color: 'rgba(99,102,241,0.4)' }}>-</span>
                          {fu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
