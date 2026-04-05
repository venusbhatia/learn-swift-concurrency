'use client';

import { motion } from 'framer-motion';
import type { NodeStatus } from '@/hooks/useTopicUnlock';

interface SkillEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fromStatus: NodeStatus;
  toStatus: NodeStatus;
  index: number;
}

export default function SkillEdge({ x1, y1, x2, y2, fromStatus, toStatus, index }: SkillEdgeProps) {
  const isActive = fromStatus === 'completed';
  const isVisible = fromStatus !== 'coming-soon' && toStatus !== 'coming-soon';

  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1 + 65} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 65}`;

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={isActive ? '#16A34A' : '#D1D5DB'}
      strokeWidth={isActive ? 2 : 1.5}
      strokeDasharray={isActive ? '6 3' : '3 3'}
      opacity={isVisible ? (isActive ? 0.7 : 0.4) : 0.15}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.3 + index * 0.05 }}
    />
  );
}
