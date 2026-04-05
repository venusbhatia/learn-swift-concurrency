'use client';

import { motion } from 'framer-motion';

interface StoryIntroProps {
  storyDay: number;
  storyIntro: string;
  kitchenMetaphor: string;
  icon: string;
}

export default function StoryIntro({ storyDay, storyIntro, kitchenMetaphor, icon }: StoryIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Day badge */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">{icon}</span>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,90,31,0.06)',
            border: '1px solid rgba(255,90,31,0.15)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5A1F' }} />
          <span className="font-mono text-xs font-medium" style={{ color: '#FF5A1F' }}>
            The Story So Far
          </span>
        </div>
      </div>

      {/* Story narrative */}
      <p
        className="text-base leading-relaxed mb-5 max-w-2xl"
        style={{ color: '#374151' }}
      >
        {storyIntro}
      </p>

      {/* Kitchen metaphor callout */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl max-w-2xl"
        style={{
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
        }}
      >
        <span className="text-lg mt-0.5">🔑</span>
        <div>
          <span className="font-mono text-[0.7rem] uppercase tracking-wider block mb-1" style={{ color: '#D97706' }}>
            Kitchen Analogy
          </span>
          <span className="text-sm" style={{ color: '#6B7280' }}>
            {kitchenMetaphor}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
