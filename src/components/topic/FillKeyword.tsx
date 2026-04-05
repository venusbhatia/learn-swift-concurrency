'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokenizeLine, TOKEN_COLORS } from '@/lib/swift-highlight';
import type { FillKeywordExercise } from '@/types/topic';

interface FillKeywordProps {
  exercise: FillKeywordExercise;
  onComplete?: (allCorrect: boolean) => void;
}

interface BlankState {
  selected: string | null;
  isCorrect: boolean | null;
  isExpanded: boolean;
  attempts: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function InlineBlank({
  blankId,
  correctAnswer,
  distractors,
  hint,
  state,
  onToggle,
  onSelect,
}: {
  blankId: string;
  correctAnswer: string;
  distractors: string[];
  hint: string;
  state: BlankState;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const options = useMemo(
    () => shuffleArray([correctAnswer, ...distractors.slice(0, 2)]),
    [correctAnswer, distractors]
  );

  // Locked in correct
  if (state.isCorrect) {
    return (
      <motion.span
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-sm font-semibold mx-0.5"
        style={{
          background: 'rgba(22,163,74,0.15)',
          color: '#22C55E',
          border: '1px solid rgba(22,163,74,0.3)',
        }}
      >
        {state.selected}
      </motion.span>
    );
  }

  // Expanded — show options
  if (state.isExpanded) {
    return (
      <span className="inline-flex items-center gap-1 mx-0.5 flex-wrap">
        {options.map((opt) => (
          <motion.button
            key={opt}
            onClick={() => onSelect(opt)}
            className="px-2.5 py-0.5 rounded-md font-mono text-sm font-medium cursor-pointer transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#f8f8f2',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.14)', scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {opt}
          </motion.button>
        ))}
      </span>
    );
  }

  // Default — pulsing ??? pill
  return (
    <motion.button
      onClick={onToggle}
      className="inline-flex items-center px-3 py-0.5 rounded-md font-mono text-sm font-bold cursor-pointer mx-0.5"
      style={{
        background: 'rgba(255,90,31,0.08)',
        color: '#FF5A1F',
        border: '1px solid rgba(255,90,31,0.35)',
      }}
      animate={{
        borderColor: ['rgba(255,90,31,0.35)', 'rgba(255,90,31,0.7)', 'rgba(255,90,31,0.35)'],
      }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
    >
      ???
    </motion.button>
  );
}

function CodeWithBlanks({
  codeTemplate,
  blanks,
  blankStates,
  onToggle,
  onSelect,
}: {
  codeTemplate: string;
  blanks: FillKeywordExercise['blanks'];
  blankStates: Record<string, BlankState>;
  onToggle: (id: string) => void;
  onSelect: (id: string, value: string) => void;
}) {
  const blankMap = useMemo(() => {
    const m: Record<string, (typeof blanks)[number]> = {};
    for (const b of blanks) m[b.id] = b;
    return m;
  }, [blanks]);

  // Split the template into lines, then within each line split on {{blank_id}}
  const lines = codeTemplate.split('\n');

  return (
    <pre
      className="p-4 rounded-xl overflow-x-auto font-mono text-[0.8rem] leading-7"
      style={{ background: '#1E1E2E', border: '1px solid #313145', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      {lines.map((line, lineIdx) => {
        // Split on blank placeholders
        const parts = line.split(/(\{\{[a-zA-Z0-9_]+\}\})/);
        return (
          <div key={lineIdx} className="flex flex-wrap items-center min-h-[1.75rem]">
            {parts.map((part, partIdx) => {
              const blankMatch = part.match(/^\{\{([a-zA-Z0-9_]+)\}\}$/);
              if (blankMatch) {
                const blankId = blankMatch[1];
                const blank = blankMap[blankId];
                if (!blank) return <span key={partIdx}>{part}</span>;
                return (
                  <InlineBlank
                    key={partIdx}
                    blankId={blankId}
                    correctAnswer={blank.correctAnswer}
                    distractors={blank.distractors}
                    hint={blank.hint}
                    state={blankStates[blankId]}
                    onToggle={() => onToggle(blankId)}
                    onSelect={(val) => onSelect(blankId, val)}
                  />
                );
              }
              // Render normal code with syntax highlighting
              return (
                <span key={partIdx}>
                  {tokenizeLine(part).map((token, j) => (
                    <span
                      key={j}
                      style={{ color: TOKEN_COLORS[token.type as keyof typeof TOKEN_COLORS] || TOKEN_COLORS.plain }}
                    >
                      {token.text}
                    </span>
                  ))}
                </span>
              );
            })}
          </div>
        );
      })}
    </pre>
  );
}

export default function FillKeyword({ exercise, onComplete }: FillKeywordProps) {
  const [blankStates, setBlankStates] = useState<Record<string, BlankState>>(() => {
    const init: Record<string, BlankState> = {};
    for (const b of exercise.blanks) {
      init[b.id] = { selected: null, isCorrect: null, isExpanded: false, attempts: 0 };
    }
    return init;
  });

  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const xpPerBlank = 5;
  const totalXP = exercise.blanks.length * xpPerBlank;

  const handleToggle = useCallback((id: string) => {
    setBlankStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], isExpanded: !prev[id].isExpanded },
    }));
    setActiveHint(null);
  }, []);

  const handleSelect = useCallback(
    (id: string, value: string) => {
      const blank = exercise.blanks.find((b) => b.id === id);
      if (!blank) return;

      const isCorrect = value === blank.correctAnswer;

      setBlankStates((prev) => {
        const next = {
          ...prev,
          [id]: {
            selected: value,
            isCorrect,
            isExpanded: !isCorrect,
            attempts: prev[id].attempts + 1,
          },
        };

        // Check if all are now correct
        const allCorrect = exercise.blanks.every((b) => next[b.id].isCorrect);
        if (allCorrect && !completed) {
          setTimeout(() => {
            setCompleted(true);
            onComplete?.(true);
          }, 300);
        }

        return next;
      });

      if (!isCorrect) {
        setActiveHint(blank.hint);
      } else {
        setActiveHint(null);
      }
    },
    [exercise.blanks, completed, onComplete]
  );

  const correctCount = exercise.blanks.filter((b) => blankStates[b.id].isCorrect).length;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-lg">✏️</span>
        <h3 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>Fill the Keyword</h3>
        <span
          className="px-2 py-0.5 rounded-full font-mono text-[0.65rem] uppercase tracking-wider"
          style={{ background: 'rgba(99,102,241,0.06)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          Interactive
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
        {/* Title + progress */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: '#374151' }}>{exercise.title}</p>
          <span className="font-mono text-xs" style={{ color: '#9CA3AF' }}>
            {correctCount}/{exercise.blanks.length}
          </span>
        </div>

        {/* Code block with inline blanks */}
        <div className="px-6 pb-4">
          <CodeWithBlanks
            codeTemplate={exercise.codeTemplate}
            blanks={exercise.blanks}
            blankStates={blankStates}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        </div>

        {/* Hint area */}
        <AnimatePresence>
          {activeHint && !completed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 overflow-hidden"
            >
              <div
                className="p-3 rounded-xl mb-4 flex items-start gap-2"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
                <span className="text-sm mt-0.5">💡</span>
                <p className="text-sm" style={{ color: '#92400E' }}>{activeHint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion banner */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-5 p-4 rounded-xl flex items-center justify-between"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className="text-xl"
                >
                  🎉
                </motion.span>
                <span className="font-semibold text-sm" style={{ color: '#16A34A' }}>
                  Complete!
                </span>
              </div>
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="font-mono text-sm font-bold"
                style={{ color: '#FF5A1F' }}
              >
                +{totalXP} XP
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
