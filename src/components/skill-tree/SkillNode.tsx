'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { TopicMeta } from '@/types/topic';
import type { NodeStatus } from '@/hooks/useTopicUnlock';

interface SkillNodeProps {
  meta: TopicMeta;
  status: NodeStatus;
  x: number;
  y: number;
  index: number;
}

const STATUS_CONFIG: Record<NodeStatus, {
  bgFill: string;
  borderColor: string;
  iconBg: string;
  glowColor: string;
  textColor: string;
  subColor: string;
  opacity: number;
  clickable: boolean;
  pulse: boolean;
}> = {
  completed: {
    bgFill: '#FFFFFF',
    borderColor: '#16A34A',
    iconBg: 'rgba(22,163,74,0.1)',
    glowColor: 'none',
    textColor: '#1A1A1A',
    subColor: '#16A34A',
    opacity: 1,
    clickable: true,
    pulse: false,
  },
  'in-progress': {
    bgFill: '#FFFFFF',
    borderColor: '#FF5A1F',
    iconBg: 'rgba(255,90,31,0.1)',
    glowColor: 'none',
    textColor: '#1A1A1A',
    subColor: '#FF5A1F',
    opacity: 1,
    clickable: true,
    pulse: true,
  },
  available: {
    bgFill: '#FFFFFF',
    borderColor: '#6366F1',
    iconBg: 'rgba(99,102,241,0.08)',
    glowColor: 'none',
    textColor: '#1A1A1A',
    subColor: '#6366F1',
    opacity: 1,
    clickable: true,
    pulse: false,
  },
  locked: {
    bgFill: '#F5F4F1',
    borderColor: '#E5E5E3',
    iconBg: 'rgba(0,0,0,0.03)',
    glowColor: 'none',
    textColor: '#9CA3AF',
    subColor: '#9CA3AF',
    opacity: 0.8,
    clickable: false,
    pulse: false,
  },
  'coming-soon': {
    bgFill: '#F5F4F1',
    borderColor: '#E5E5E3',
    iconBg: 'rgba(0,0,0,0.02)',
    glowColor: 'none',
    textColor: '#D1D5DB',
    subColor: '#D1D5DB',
    opacity: 0.5,
    clickable: false,
    pulse: false,
  },
};

export default function SkillNode({ meta, status, x, y, index }: SkillNodeProps) {
  const router = useRouter();
  const cfg = STATUS_CONFIG[status];
  const w = 340;
  const h = 120;

  const handleClick = () => {
    if (cfg.clickable) router.push(`/topic/${meta.slug}`);
  };

  const icon =
    status === 'locked' ? '🔒'
    : status === 'coming-soon' ? '⏳'
    : status === 'completed' ? '✓'
    : meta.icon;

  return (
    <motion.g
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: cfg.opacity, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{ cursor: cfg.clickable ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {/* Outer pulse ring */}
      {cfg.pulse && (
        <motion.rect
          x={x - w / 2 - 3}
          y={y - h / 2 - 3}
          width={w + 6}
          height={h + 6}
          rx={18}
          fill="none"
          stroke={cfg.borderColor}
          strokeWidth={0.5}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Card shadow (SVG filter alternative — just use a slightly offset rect) */}
      <rect
        x={x - w / 2 + 1}
        y={y - h / 2 + 2}
        width={w}
        height={h}
        rx={16}
        fill="rgba(0,0,0,0.04)"
      />

      {/* Card background */}
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={16}
        fill={cfg.bgFill}
        stroke={cfg.borderColor}
        strokeWidth={1.5}
      />

      {/* Icon circle */}
      <circle
        cx={x - w / 2 + 30}
        cy={y}
        r={18}
        fill={cfg.iconBg}
      />

      {/* Icon */}
      <text
        x={x - w / 2 + 30}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={status === 'completed' ? 18 : 22}
        fontWeight={status === 'completed' ? 700 : 400}
        fill={status === 'completed' ? '#16A34A' : undefined}
        fontFamily={status === 'completed' ? 'var(--font-mono)' : undefined}
      >
        {icon}
      </text>

      {/* Title */}
      <text
        x={x - w / 2 + 56}
        y={y - 10}
        fontSize={17}
        fontWeight={600}
        fontFamily="var(--font-sans)"
        fill={cfg.textColor}
        dominantBaseline="middle"
      >
        {meta.title}
      </text>

      {/* Subtitle */}
      <text
        x={x - w / 2 + 56}
        y={y + 10}
        fontSize={13}
        fontFamily="var(--font-mono)"
        fill={cfg.subColor}
        opacity={0.9}
        dominantBaseline="middle"
      >
        {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : meta.subtitle}
      </text>
    </motion.g>
  );
}
