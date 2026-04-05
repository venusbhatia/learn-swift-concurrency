'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  glowColor?: 'cyan' | 'magenta' | 'electric';
  hoverable?: boolean;
  noPadding?: boolean;
}

const glowBorders: Record<string, string> = {
  cyan: 'rgba(255, 90, 31, 0.15)',
  magenta: 'rgba(99, 102, 241, 0.15)',
  electric: 'rgba(99, 102, 241, 0.1)',
};

const glowShadows: Record<string, string> = {
  cyan: '0 4px 12px rgba(0,0,0,0.06)',
  magenta: '0 4px 12px rgba(0,0,0,0.06)',
  electric: '0 4px 12px rgba(0,0,0,0.06)',
};

export default function GlassCard({
  children,
  className = '',
  glowColor,
  hoverable = false,
  noPadding = false,
  style,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card rounded-2xl ${noPadding ? '' : 'p-6'} ${className}`}
      style={{
        borderColor: glowColor ? glowBorders[glowColor] : undefined,
        boxShadow: glowColor
          ? `${glowShadows[glowColor]}, 0 1px 3px rgba(0,0,0,0.04)`
          : undefined,
        cursor: hoverable ? 'pointer' : undefined,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      whileHover={hoverable ? { y: -2, scale: 1.005 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
