'use client';

import { motion } from 'framer-motion';
import { skillNodePositions, skillEdges, getNodePosition } from '@/data/skill-tree-layout';
import { topicsMeta } from '@/data/topics';
import { useAllTopicStatuses } from '@/hooks/useTopicUnlock';
import SkillNode from './SkillNode';
import SkillEdge from './SkillEdge';

export default function SkillTreeGraph() {
  const statuses = useAllTopicStatuses();

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 1800 2000"
        className="w-full"
        style={{ minHeight: '120vh' }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(0,0,0,0.04)"
              strokeWidth={0.5}
            />
          </pattern>
        </defs>
        <rect width="1800" height="2000" fill="url(#grid)" />

        {/* Tier labels */}
        {[
          { tier: 1, y: 40, label: 'FOUNDATION' },
          { tier: 2, y: 290, label: 'CORE ASYNC' },
          { tier: 3, y: 540, label: 'PARALLELISM' },
          { tier: 4, y: 790, label: 'SAFETY' },
          { tier: 5, y: 1040, label: 'ARCHITECTURE' },
          { tier: 6, y: 1290, label: 'APPLIED' },
          { tier: 7, y: 1540, label: 'SWIFTUI' },
        ].map(({ tier, y, label }) => (
          <motion.text
            key={tier}
            x={30}
            y={y}
            fontSize={14}
            fontWeight={700}
            letterSpacing="0.2em"
            fontFamily="var(--font-mono)"
            fill="#9CA3AF"
            dominantBaseline="middle"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.8, x: 30 }}
            transition={{ delay: tier * 0.1 }}
          >
            {label}
          </motion.text>
        ))}

        {/* Edges */}
        {skillEdges.map((edge, i) => {
          const fromPos = getNodePosition(edge.from);
          const toPos = getNodePosition(edge.to);
          if (!fromPos || !toPos) return null;

          return (
            <SkillEdge
              key={`${edge.from}-${edge.to}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              fromStatus={statuses[edge.from] ?? 'locked'}
              toStatus={statuses[edge.to] ?? 'locked'}
              index={i}
            />
          );
        })}

        {/* Nodes */}
        {skillNodePositions.map((pos, i) => {
          const meta = topicsMeta.find((t) => t.slug === pos.slug);
          if (!meta) return null;

          return (
            <SkillNode
              key={pos.slug}
              meta={meta}
              status={statuses[pos.slug] ?? 'locked'}
              x={pos.x}
              y={pos.y}
              index={i}
            />
          );
        })}
      </svg>
    </div>
  );
}
