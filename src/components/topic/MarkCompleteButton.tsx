'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/lib/progress-store';
import { topicsMeta } from '@/data/topics';

interface MarkCompleteButtonProps {
  slug: string;
  isCompleted: boolean;
}

export default function MarkCompleteButton({ slug, isCompleted }: MarkCompleteButtonProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const markTopicCompleted = useProgressStore((s) => s.markTopicCompleted);
  const router = useRouter();

  const currentMeta = topicsMeta.find((t) => t.slug === slug);
  const nextTopic = topicsMeta.find(
    (t) => t.order === (currentMeta?.order ?? 0) + 1 && t.available
  );

  const handleComplete = () => {
    markTopicCompleted(slug);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="relative py-8">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4 + Math.random() * 4,
                  height: 4 + Math.random() * 4,
                  background: ['#FF5A1F', '#6366F1', '#16A34A', '#D97706', '#EC4899'][i % 5],
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 200 - 80,
                  scale: [0, 1.2, 0.8],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.8,
                  delay: Math.random() * 0.4,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="text-center">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold" style={{ color: '#16A34A' }}>Level Complete!</span>
            </div>

            <div className="flex gap-3 justify-center">
              {nextTopic && (
                <a
                  href={`/topic/${nextTopic.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all"
                  style={{
                    color: '#FFFFFF',
                    background: '#FF5A1F',
                    boxShadow: '0 4px 12px rgba(255,90,31,0.2)',
                  }}
                >
                  Next: {nextTopic.title}
                  <span>&#8594;</span>
                </a>
              )}
              <a
                href="/skill-tree"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all"
                style={{
                  color: '#6B7280',
                  border: '1px solid #E5E5E3',
                }}
              >
                Skill Tree
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={handleComplete}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all"
            style={{
              color: '#FFFFFF',
              background: '#FF5A1F',
              boxShadow: '0 4px 12px rgba(255,90,31,0.2)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(255,90,31,0.25)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span>✓</span>
            Mark as Complete
          </motion.button>
        )}
      </div>
    </div>
  );
}
