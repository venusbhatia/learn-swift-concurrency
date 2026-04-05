'use client';

import { tokenizeLine, TOKEN_COLORS } from '@/lib/swift-highlight';

interface SideBySideCodeProps {
  oldLabel: string;
  oldCode: string;
  newLabel: string;
  newCode: string;
}

function HighlightedBlock({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <pre className="text-[0.8rem] leading-6 font-mono p-4 overflow-x-auto">
      {lines.map((line, i) => (
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

export default function SideBySideCode({ oldLabel, oldCode, newLabel, newCode }: SideBySideCodeProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Old way */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#1E1E2E',
          border: '1px solid rgba(220,38,38,0.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.06)' }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: '#DC2626' }} />
          <span className="font-mono text-[0.7rem]" style={{ color: '#DC2626' }}>{oldLabel}</span>
        </div>
        <HighlightedBlock code={oldCode} />
      </div>

      {/* New way */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#1E1E2E',
          border: '1px solid rgba(22,163,74,0.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(22,163,74,0.15)', background: 'rgba(22,163,74,0.06)' }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} />
          <span className="font-mono text-[0.7rem]" style={{ color: '#16A34A' }}>{newLabel}</span>
        </div>
        <HighlightedBlock code={newCode} />
      </div>
    </div>
  );
}
