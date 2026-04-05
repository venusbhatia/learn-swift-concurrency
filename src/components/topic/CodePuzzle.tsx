'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { tokenizeLine, TOKEN_COLORS } from '@/lib/swift-highlight';
import type { CodePuzzle as CP } from '@/types/topic';

interface CodePuzzleProps {
  puzzle: CP;
  onScore?: (score: number) => void;
}

function PuzzleCode({ code }: { code: string }) {
  return (
    <pre
      className="p-4 rounded-xl overflow-x-auto font-mono text-[0.8rem] leading-6"
      style={{ background: '#1E1E2E', border: '1px solid #313145', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      {code.split('\n').map((line, i) => (
        <div key={i}>
          {tokenizeLine(line).map((token, j) => (
            <span
              key={j}
              style={{ color: TOKEN_COLORS[token.type as keyof typeof TOKEN_COLORS] || TOKEN_COLORS.plain }}
            >
              {token.text}
            </span>
          ))}
          {'\n'}
        </div>
      ))}
    </pre>
  );
}

export default function CodePuzzle({ puzzle, onScore }: CodePuzzleProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const isCorrect = selectedOption === puzzle.correctOptionIndex;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    onScore?.(isCorrect ? 100 : 0);
  };

  const labels: Record<string, string> = {
    'predict-output': 'Predict the Output',
    'spot-bug': 'Spot the Bug',
    'fill-blank': 'Fill in the Blank',
    reorder: 'Reorder the Code',
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-lg">🧩</span>
        <h3 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>Code Puzzle</h3>
        <span
          className="px-2 py-0.5 rounded-full font-mono text-[0.65rem] uppercase tracking-wider"
          style={{ background: 'rgba(99,102,241,0.06)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          {labels[puzzle.type]}
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
        <div className="p-6">
          <p className="text-sm mb-4" style={{ color: '#374151' }}>{puzzle.prompt}</p>
          <PuzzleCode code={puzzle.code} />
        </div>

        {/* Options */}
        {puzzle.options && (
          <div className="px-6 pb-2 space-y-2">
            {puzzle.options.map((option, i) => {
              let borderColor = '#E5E5E3';
              let bg = '#FAFAF8';
              let textColor = '#374151';

              if (submitted) {
                if (i === puzzle.correctOptionIndex) {
                  borderColor = '#16A34A';
                  bg = 'rgba(22,163,74,0.04)';
                  textColor = '#16A34A';
                } else if (i === selectedOption) {
                  borderColor = '#DC2626';
                  bg = 'rgba(220,38,38,0.04)';
                  textColor = '#DC2626';
                }
              } else if (i === selectedOption) {
                borderColor = '#6366F1';
                bg = 'rgba(99,102,241,0.04)';
                textColor = '#1A1A1A';
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => !submitted && setSelectedOption(i)}
                  className="w-full text-left px-4 py-3.5 rounded-xl font-mono text-sm transition-all"
                  style={{ border: `1px solid ${borderColor}`, background: bg, color: textColor }}
                  whileHover={submitted ? {} : { scale: 1.005 }}
                  whileTap={submitted ? {} : { scale: 0.995 }}
                >
                  <span className="mr-3" style={{ color: '#9CA3AF' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Submit / Result */}
        <div className="p-6 pt-4">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-medium transition-all disabled:opacity-20"
              style={{
                color: '#6366F1',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              Submit Answer
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                {isCorrect ? '🎉' : '🤔'}
              </motion.span>
              <span className="font-mono text-sm" style={{ color: isCorrect ? '#16A34A' : '#DC2626' }}>
                {isCorrect ? 'Nailed it!' : 'Not quite — keep studying!'}
              </span>
              {!showSolution && !isCorrect && (
                <button
                  onClick={() => setShowSolution(true)}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all"
                  style={{
                    color: '#6B7280',
                    border: '1px solid #E5E5E3',
                  }}
                >
                  Show Explanation
                </button>
              )}
            </div>
          )}

          {showSolution && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl"
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
              }}
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-wider block mb-2" style={{ color: '#16A34A' }}>
                Explanation
              </span>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                {puzzle.solution}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
