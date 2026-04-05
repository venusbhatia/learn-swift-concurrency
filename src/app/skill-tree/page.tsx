'use client';

import { motion } from 'framer-motion';
import SkillTreeGraph from '@/components/skill-tree/SkillTreeGraph';
import { useProgressStore } from '@/lib/progress-store';

export default function SkillTreePage() {
  const completionPercent = useProgressStore((s) => s.completionPercent());
  const completedCount = useProgressStore((s) =>
    Object.values(s.topics).filter((t) => t.status === 'completed').length
  );

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        className="max-w-7xl mx-auto px-6 pt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: '#1A1A1A' }}>
              Skill Tree
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Complete topics to unlock the next challenge
            </p>
          </div>

          {/* Mini progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-mono text-xs block" style={{ color: '#6B7280' }}>Progress</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#FF5A1F' }}>
                {completedCount}/17
              </span>
            </div>
            <div
              className="w-24 h-1.5 rounded-full overflow-hidden"
              style={{ background: '#F5F4F1', border: '1px solid #E5E5E3' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #FF5A1F, #6366F1)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-6">
          {[
            { color: '#6366F1', border: '#6366F1', label: 'Available' },
            { color: '#FF5A1F', border: '#FF5A1F', label: 'In Progress' },
            { color: '#16A34A', border: '#16A34A', label: 'Completed', filled: true },
            { color: '#D1D5DB', border: '#E5E5E3', label: 'Locked' },
          ].map(({ color, border, label, filled }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: filled ? color : 'transparent',
                  border: `1.5px solid ${border}`,
                }}
              />
              <span className="text-xs" style={{ color: '#6B7280' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Graph */}
        <SkillTreeGraph />
      </motion.div>
    </div>
  );
}
