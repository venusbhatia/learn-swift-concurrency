'use client';

import { motion } from 'framer-motion';
import ProgressRing from '@/components/ui/ProgressRing';
import { useProgressStore } from '@/lib/progress-store';
import { topicsMeta } from '@/data/topics';
import { useAllTopicStatuses, type NodeStatus } from '@/hooks/useTopicUnlock';

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return '< 1m';
}

const statusDots: Record<NodeStatus, { color: string }> = {
  completed: { color: '#16A34A' },
  'in-progress': { color: '#FF5A1F' },
  available: { color: '#6366F1' },
  locked: { color: '#D1D5DB' },
  'coming-soon': { color: '#E5E5E3' },
};

const statusLabels: Record<NodeStatus, string> = {
  completed: 'Done',
  'in-progress': 'Active',
  available: 'Ready',
  locked: 'Locked',
  'coming-soon': 'Soon',
};

export default function DashboardPage() {
  const completionPercent = useProgressStore((s) => s.completionPercent());
  const streak = useProgressStore((s) => s.streak);
  const totalTime = useProgressStore((s) => s.totalTimeSpentMs);
  const topics = useProgressStore((s) => s.topics);
  const statuses = useAllTopicStatuses();
  const completedCount = Object.values(topics).filter((t) => t.status === 'completed').length;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const last90Days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        className="max-w-4xl mx-auto px-6 pt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-8" style={{ color: '#1A1A1A' }}>
          Your Stats
        </h1>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {/* Completion */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E3',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <ProgressRing progress={completionPercent} size={72} strokeWidth={4}>
              <span className="font-mono text-base font-bold" style={{ color: '#FF5A1F' }}>
                {completionPercent}%
              </span>
            </ProgressRing>
            <span className="text-sm font-medium mt-3" style={{ color: '#6B7280' }}>Completion</span>
            <span className="font-mono text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              {completedCount} of 17
            </span>
          </div>

          {/* Streak */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E3',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <motion.div
              className="font-mono font-bold"
              style={{ fontSize: '2.5rem', lineHeight: 1, color: '#6366F1' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              {streak.currentStreak}
            </motion.div>
            <span className="text-sm font-medium mt-3" style={{ color: '#6B7280' }}>Day Streak</span>
            <span className="font-mono text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              Best: {streak.longestStreak}
            </span>
          </div>

          {/* Time */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E3',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <motion.div
              className="font-mono font-bold"
              style={{ fontSize: '2.5rem', lineHeight: 1, color: '#FF5A1F' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              {formatTime(totalTime)}
            </motion.div>
            <span className="text-sm font-medium mt-3" style={{ color: '#6B7280' }}>Time Invested</span>
            <span className="font-mono text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              Keep going
            </span>
          </div>
        </div>

        {/* Activity calendar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: '#6B7280' }}>Activity</h2>
            <span className="font-mono text-xs" style={{ color: '#9CA3AF' }}>Last 90 days</span>
          </div>
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E3',
            }}
          >
            <div className="flex flex-wrap gap-[3px]">
              {last90Days.map((date) => {
                const isActive = streak.activeDates.includes(date);
                const isToday = date === todayStr;
                return (
                  <div
                    key={date}
                    className="rounded-sm transition-colors"
                    style={{
                      width: '10px',
                      height: '10px',
                      background: isActive
                        ? '#FF5A1F'
                        : isToday
                        ? 'rgba(255,90,31,0.1)'
                        : '#F5F4F1',
                      border: isToday && !isActive ? '1px solid rgba(255,90,31,0.3)' : 'none',
                    }}
                    title={date}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Topics list */}
        <div>
          <h2 className="text-sm font-medium mb-4" style={{ color: '#6B7280' }}>All Topics</h2>
          <div className="space-y-1">
            {topicsMeta.map((meta, i) => {
              const nodeStatus = statuses[meta.slug] ?? 'locked';
              const progress = topics[meta.slug];
              const dot = statusDots[nodeStatus];
              const isClickable = nodeStatus === 'completed' || nodeStatus === 'in-progress' || nodeStatus === 'available';

              return (
                <motion.a
                  key={meta.slug}
                  href={isClickable ? `/topic/${meta.slug}` : undefined}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
                  style={{
                    background: 'transparent',
                    cursor: isClickable ? 'pointer' : 'default',
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  whileHover={isClickable ? {
                    background: '#F5F4F1',
                    x: 2,
                  } : {}}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Status dot */}
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: dot.color }}
                    />
                    {/* Icon + name */}
                    <span className="text-base">{meta.icon}</span>
                    <div>
                      <span
                        className="text-sm font-medium block"
                        style={{ color: nodeStatus === 'locked' || nodeStatus === 'coming-soon' ? '#D1D5DB' : '#1A1A1A' }}
                      >
                        {meta.title}
                      </span>
                      <span className="font-mono text-xs" style={{ color: '#9CA3AF' }}>
                        {meta.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {progress?.puzzleScore !== undefined && (
                      <span className="font-mono text-xs" style={{ color: '#6366F1' }}>
                        {progress.puzzleScore}%
                      </span>
                    )}
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-md"
                      style={{
                        color: dot.color,
                        background: `${dot.color}10`,
                      }}
                    >
                      {statusLabels[nodeStatus]}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="/skill-tree"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              color: '#FFFFFF',
              background: '#FF5A1F',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(255,90,31,0.15)',
            }}
          >
            Continue Learning
          </a>
        </div>
      </motion.div>
    </div>
  );
}
