// Lightweight inline markdown renderer for concept section text
// Handles **bold**, `code`, and paragraph breaks

import React from 'react';

export function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split('\n\n');

  return paragraphs.map((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    return (
      <p key={pi} className="mb-4 last:mb-0">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, `code`, or plain text
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)|([^*`]+)/g;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={i++} style={{ color: '#1A1A1A', fontWeight: 600 }}>
          {match[2]}
        </strong>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={i++}
          className="font-mono text-[0.8em] px-1.5 py-0.5 rounded-md"
          style={{
            background: 'rgba(255,90,31,0.06)',
            color: '#D4410C',
            border: '1px solid rgba(255,90,31,0.12)',
          }}
        >
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      // plain text — handle newlines within
      const lines = match[5].split('\n');
      lines.forEach((line, li) => {
        if (li > 0) parts.push(<br key={`br-${i++}`} />);
        parts.push(<span key={i++}>{line}</span>);
      });
    }
    i++;
  }

  return parts;
}
