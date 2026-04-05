'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCodeStepper } from '@/hooks/useCodeStepper';
import { tokenizeLine, TOKEN_COLORS } from '@/lib/swift-highlight';
import type { CodeBlock } from '@/types/topic';

interface CodePlaygroundProps {
  codeBlock: CodeBlock;
}

function TokenSpan({ text, type }: { text: string; type: string }) {
  return (
    <span style={{ color: TOKEN_COLORS[type as keyof typeof TOKEN_COLORS] || TOKEN_COLORS.plain }}>
      {text}
    </span>
  );
}

function CodeLine({
  line,
  lineNumber,
  isActive,
  isExecuted,
  threadIndicator,
}: {
  line: string;
  lineNumber: number;
  isActive: boolean;
  isExecuted: boolean;
  threadIndicator?: 'main' | 'background' | 'suspended';
}) {
  const tokens = tokenizeLine(line);
  const threadBadge = {
    main: { color: '#FF5A1F', label: 'main' },
    background: { color: '#6366F1', label: 'bg' },
    suspended: { color: '#D97706', label: 'wait' },
  };

  return (
    <div
      className="group flex items-center transition-all duration-300 ease-out"
      style={{
        background: isActive
          ? 'linear-gradient(90deg, rgba(255,90,31,0.12) 0%, rgba(255,90,31,0.03) 100%)'
          : isExecuted
          ? 'rgba(99,102,241,0.04)'
          : 'transparent',
        borderLeft: isActive ? '2px solid #FF5A1F' : '2px solid transparent',
        minHeight: '1.75rem',
      }}
    >
      {/* Line number */}
      <span
        className="select-none text-right shrink-0 pr-4 pl-4"
        style={{
          width: '3.5rem',
          fontSize: '0.7rem',
          color: isActive ? '#FF5A1F' : '#3a3a5c',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {lineNumber}
      </span>

      {/* Thread indicator dot */}
      <span className="w-5 shrink-0 flex justify-center">
        {threadIndicator && isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: threadBadge[threadIndicator].color,
              boxShadow: `0 0 6px ${threadBadge[threadIndicator].color}80`,
              animation: threadIndicator === 'suspended' ? 'pulse 1.5s ease-in-out infinite' : undefined,
            }}
            title={threadBadge[threadIndicator].label}
          />
        )}
      </span>

      {/* Code tokens */}
      <code className="flex-1 whitespace-pre" style={{ fontSize: '0.8125rem', lineHeight: '1.75rem' }}>
        {tokens.map((token, i) => (
          <TokenSpan key={i} text={token.text} type={token.type} />
        ))}
      </code>

      {/* Thread badge on active line */}
      {threadIndicator && isActive && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mr-4 shrink-0 px-1.5 py-0.5 rounded text-[0.6rem] font-mono font-medium"
          style={{
            color: threadBadge[threadIndicator].color,
            background: `${threadBadge[threadIndicator].color}15`,
            border: `1px solid ${threadBadge[threadIndicator].color}30`,
          }}
        >
          {threadBadge[threadIndicator].label}
        </motion.span>
      )}
    </div>
  );
}

export default function CodePlayground({ codeBlock }: CodePlaygroundProps) {
  const stepper = useCodeStepper(codeBlock.steps);
  const lines = codeBlock.code.split('\n');

  const isLineInRange = (lineNum: number, range: [number, number]) =>
    lineNum >= range[0] && lineNum <= range[1];

  const executedRanges = codeBlock.steps
    .slice(0, stepper.currentIndex)
    .map((s) => s.lineRange);

  const isLineExecuted = (lineNum: number) =>
    executedRanges.some((r) => isLineInRange(lineNum, r));

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#1E1E2E',
        border: '1px solid #313145',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header bar — macOS-style */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="font-mono text-xs" style={{ color: '#6B7280' }}>
          {codeBlock.label}
        </span>
        <div className="w-14" /> {/* spacer for centering */}
      </div>

      <div className="flex">
        {/* Code panel */}
        <div className="flex-1 overflow-x-auto py-2">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isActive = stepper.currentStep
              ? isLineInRange(lineNum, stepper.currentStep.lineRange)
              : false;
            return (
              <CodeLine
                key={i}
                line={line}
                lineNumber={lineNum}
                isActive={isActive}
                isExecuted={isLineExecuted(lineNum)}
                threadIndicator={isActive ? stepper.currentStep?.threadIndicator : undefined}
              />
            );
          })}
        </div>

        {/* Explanation sidebar */}
        <AnimatePresence mode="wait">
          {stepper.currentStep && (
            <motion.div
              key={stepper.currentIndex}
              className="w-[22rem] shrink-0 p-5 flex flex-col justify-center"
              style={{
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(20,20,35,0.8)',
              }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step counter */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.65rem] font-mono font-bold"
                  style={{
                    background: 'rgba(255,90,31,0.15)',
                    color: '#FF5A1F',
                    border: '1px solid rgba(255,90,31,0.25)',
                  }}
                >
                  {stepper.currentIndex + 1}
                </span>
                <span className="text-[0.65rem] font-mono" style={{ color: '#6B7280' }}>
                  of {stepper.totalSteps}
                </span>
              </div>

              {/* Explanation text */}
              <p className="text-[0.85rem] leading-relaxed" style={{ color: '#D1D5DB' }}>
                {stepper.currentStep.explanation}
              </p>

              {/* Execution note callout */}
              {stepper.currentStep.executionNote && (
                <div
                  className="mt-4 px-3 py-2.5 rounded-lg text-[0.75rem] font-mono"
                  style={{
                    background: 'rgba(217,119,6,0.08)',
                    border: '1px solid rgba(217,119,6,0.2)',
                    color: '#FBBF24',
                  }}
                >
                  {stepper.currentStep.executionNote}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Playback controls */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Transport */}
        <div className="flex items-center gap-1">
          <button
            onClick={stepper.prev}
            disabled={stepper.isFirst}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm transition-all disabled:opacity-20"
            style={{ color: '#9CA3AF', background: stepper.isFirst ? 'transparent' : 'rgba(255,255,255,0.04)' }}
          >
            &#9664;
          </button>
          <button
            onClick={stepper.togglePlay}
            className="w-10 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-all"
            style={{
              color: stepper.isPlaying ? '#6366F1' : '#FF5A1F',
              background: stepper.isPlaying ? 'rgba(99,102,241,0.1)' : 'rgba(255,90,31,0.1)',
              border: `1px solid ${stepper.isPlaying ? 'rgba(99,102,241,0.25)' : 'rgba(255,90,31,0.25)'}`,
            }}
          >
            {stepper.isPlaying ? '||' : '|>'}
          </button>
          <button
            onClick={stepper.next}
            disabled={stepper.isLast}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm transition-all disabled:opacity-20"
            style={{ color: '#9CA3AF', background: stepper.isLast ? 'transparent' : 'rgba(255,255,255,0.04)' }}
          >
            &#9654;
          </button>
        </div>

        {/* Step timeline */}
        <div className="flex items-center gap-1">
          {codeBlock.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => stepper.goTo(i)}
              className="transition-all duration-200"
              style={{
                width: i === stepper.currentIndex ? '1.25rem' : '0.375rem',
                height: '0.375rem',
                borderRadius: '0.25rem',
                background:
                  i === stepper.currentIndex
                    ? '#FF5A1F'
                    : i < stepper.currentIndex
                    ? 'rgba(255,90,31,0.35)'
                    : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* Keyboard hint */}
        <div className="flex items-center gap-1.5">
          {['<-', '->', 'Space'].map((key) => (
            <span
              key={key}
              className="px-1.5 py-0.5 rounded font-mono"
              style={{
                fontSize: '0.6rem',
                color: '#6B7280',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
