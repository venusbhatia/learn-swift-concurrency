'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import NeonButton from '@/components/ui/NeonButton';
import { useProgressStore } from '@/lib/progress-store';

const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: '#06060c' }} />,
});

const TOPIC_PREVIEW = [
  { icon: '🛡', name: 'Error Handling', day: 1 },
  { icon: '📦', name: 'Value vs Reference', day: 2 },
  { icon: '⚡', name: 'Async / Await', day: 3 },
  { icon: '👷', name: 'Tasks', day: 5 },
  { icon: '🔒', name: 'Actors', day: 8 },
];

export default function LandingPage() {
  const completionPercent = useProgressStore((s) => s.completionPercent());
  const completedTopics = useProgressStore((s) =>
    Object.values(s.topics).filter((t) => t.status === 'completed').length
  );

  return (
    <div className="relative min-h-screen overflow-hidden -mt-16 pt-16" style={{ background: '#06060c' }}>
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Gradient overlay — fully dark */}
      <div className="absolute inset-0 z-10" style={{
        background: 'linear-gradient(180deg, rgba(6,6,12,0.3) 0%, rgba(6,6,12,0.7) 50%, rgba(6,6,12,0.95) 85%, #06060c 100%)',
      }} />

      {/* Main content */}
      <div className="relative z-20 min-h-screen flex flex-col">

        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32">
          <motion.div
            className="text-center max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tagline chip */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: 'rgba(255,90,31,0.08)',
                border: '1px solid rgba(255,90,31,0.2)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5A1F' }} />
              <span className="font-mono text-xs" style={{ color: '#FF5A1F' }}>Swift Concurrency Bootcamp</span>
            </motion.div>

            <h1 className="mb-6" style={{ lineHeight: 1.05 }}>
              <span
                className="block text-6xl md:text-8xl font-bold tracking-tight"
                style={{ color: '#f0f0ff' }}
              >
                The Concurrency
              </span>
              <span
                className="block text-6xl md:text-8xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF5A1F 0%, #F97316 50%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Kitchen
              </span>
            </h1>

            <p
              className="text-lg md:text-xl mb-3 max-w-lg mx-auto"
              style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}
            >
              You just bought a restaurant.
              <br />
              Now learn to run it without burning it down.
            </p>

            <p
              className="text-sm mb-10 max-w-md mx-auto font-mono"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Master async/await, actors, tasks &amp; more through interactive stories,
              3D visualizations, and interview-grade challenges.
            </p>

            <div className="flex gap-4 justify-center">
              <NeonButton href="/skill-tree" color="cyan" size="lg">
                {completedTopics > 0 ? 'Continue Journey' : 'Begin Journey'}
              </NeonButton>
              {completedTopics > 0 && (
                <NeonButton href="/dashboard" color="electric" size="lg">
                  Dashboard
                </NeonButton>
              )}
            </div>

            {/* XP bar for returning users */}
            {completedTopics > 0 && (
              <motion.div
                className="mt-8 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Progress</span>
                  <span className="font-mono text-xs font-bold" style={{ color: '#FF5A1F' }}>
                    {completionPercent}%
                  </span>
                </div>
                <div
                  className="w-48 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #FF5A1F, #6366F1)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom topic preview strip — dark themed to match hero */}
        <motion.div
          className="px-6 pb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest mb-4 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Your first 5 challenges
            </p>
            <div className="flex justify-center gap-3">
              {TOPIC_PREVIEW.map((topic, i) => (
                <motion.div
                  key={topic.name}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  whileHover={{
                    borderColor: 'rgba(255,90,31,0.3)',
                    background: 'rgba(255,90,31,0.05)',
                  }}
                >
                  <span className="text-lg">{topic.icon}</span>
                  <div>
                    <span className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{topic.name}</span>
                    <span className="font-mono text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Day {topic.day}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
