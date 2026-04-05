'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface NeonButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color?: 'cyan' | 'magenta' | 'electric';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const styles = {
  cyan: {
    color: '#FFFFFF',
    background: '#FF5A1F',
    shadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    hoverShadow: '0 4px 12px rgba(255,90,31,0.25)',
  },
  magenta: {
    color: '#FFFFFF',
    background: '#6366F1',
    shadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    hoverShadow: '0 4px 12px rgba(99,102,241,0.25)',
  },
  electric: {
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.06)',
    shadow: 'none',
    hoverShadow: '0 2px 8px rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
};

const sizes = {
  sm: { padding: '0.5rem 1rem', fontSize: '0.8125rem' },
  md: { padding: '0.625rem 1.5rem', fontSize: '0.875rem' },
  lg: { padding: '0.875rem 2rem', fontSize: '1rem' },
};

export default function NeonButton({
  children,
  href,
  onClick,
  color = 'cyan',
  size = 'md',
  className = '',
  disabled = false,
}: NeonButtonProps) {
  const s = styles[color];
  const sz = sizes[size];

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    letterSpacing: '-0.01em',
    color: s.color,
    background: s.background,
    boxShadow: s.shadow,
    border: ('border' in s) ? s.border as string : 'none',
    padding: sz.padding,
    fontSize: sz.fontSize,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const motionProps = disabled
    ? {}
    : {
        whileHover: { scale: 1.03, boxShadow: s.hoverShadow },
        whileTap: { scale: 0.97 },
      };

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        <motion.span style={baseStyle} {...motionProps}>
          {children}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      style={baseStyle}
      className={className}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
