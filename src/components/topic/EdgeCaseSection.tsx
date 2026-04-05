'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokenizeLine, TOKEN_COLORS } from '@/lib/swift-highlight';

interface EdgeCase {
  question: string;
  answer: string;
  code?: string;
}

interface EdgeCaseSectionProps {
  edgeCases: EdgeCase[];
}

function MiniCode({ code }: { code: string }) {
  return (
    <pre
      className="mt-3 p-3 rounded-lg overflow-x-auto font-mono text-[0.75rem] leading-5"
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

function EdgeCaseCard({ edgeCase }: { edgeCase: EdgeCase }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        background: isOpen ? '#FFFBEB' : '#FFFFFF',
        border: `1px solid ${isOpen ? '#FDE68A' : '#E5E5E3'}`,
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span style={{ color: '#D97706' }}>?</span>
          <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{edgeCase.question}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: '#9CA3AF', fontSize: '0.8rem' }}
        >
          &#9660;
        </motion.span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4" style={{ borderTop: '1px solid #E5E5E3' }}>
              <p className="text-sm leading-relaxed pt-3" style={{ color: '#6B7280' }}>{edgeCase.answer}</p>
              {edgeCase.code && <MiniCode code={edgeCase.code} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EdgeCaseSection({ edgeCases }: EdgeCaseSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-lg">⚡</span>
        <h3 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>What If...?</h3>
        <span
          className="px-2 py-0.5 rounded-full font-mono text-[0.65rem] uppercase tracking-wider"
          style={{ background: 'rgba(217,119,6,0.06)', color: '#D97706', border: '1px solid rgba(217,119,6,0.15)' }}
        >
          Edge Cases
        </span>
      </div>
      <div className="space-y-2">
        {edgeCases.map((ec, i) => (
          <EdgeCaseCard key={i} edgeCase={ec} />
        ))}
      </div>
    </div>
  );
}
