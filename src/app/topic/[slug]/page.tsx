'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getTopicContent } from '@/data/topics/index';
import type { Topic } from '@/types/topic';
import { useTopicStatus } from '@/hooks/useTopicUnlock';
import { useProgressStore } from '@/lib/progress-store';
import StoryIntro from '@/components/topic/StoryIntro';
import CodePlayground from '@/components/topic/CodePlayground';
import SideBySideCode from '@/components/topic/SideBySideCode';
import EdgeCaseSection from '@/components/topic/EdgeCaseSection';
import InterviewQuestion from '@/components/topic/InterviewQuestion';
import CodePuzzle from '@/components/topic/CodePuzzle';
import MarkCompleteButton from '@/components/topic/MarkCompleteButton';
import ConceptScene from '@/components/topic/ConceptScene';
import { renderMarkdown } from '@/lib/render-markdown';
import NeonButton from '@/components/ui/NeonButton';
import WhatHappensNext from '@/components/topic/WhatHappensNext';
import FillKeyword from '@/components/topic/FillKeyword';
import QuickCheck from '@/components/topic/QuickCheck';

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const status = useTopicStatus(slug);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const markTopicStarted = useProgressStore((s) => s.markTopicStarted);
  const markInterviewQViewed = useProgressStore((s) => s.markInterviewQViewed);
  const recordPuzzleScore = useProgressStore((s) => s.recordPuzzleScore);
  const topicProgress = useProgressStore((s) => s.topics[slug]);

  useEffect(() => {
    async function load() {
      const content = await getTopicContent(slug);
      setTopic(content);
      setLoading(false);
      if (content) {
        const totalSteps = content.sections.reduce(
          (acc, s) =>
            acc + (s.codeBlocks?.reduce((a, cb) => a + cb.steps.length, 0) ?? 0),
          0
        );
        markTopicStarted(slug, totalSteps);
      }
    }
    load();
  }, [slug, markTopicStarted]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-mono" style={{ color: '#FF5A1F' }}>Loading topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-mono" style={{ color: '#6B7280' }}>Topic not found or not yet available.</p>
        <NeonButton href="/skill-tree" color="cyan">Back to Skill Tree</NeonButton>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🔒</span>
        <p className="font-mono" style={{ color: '#6B7280' }}>Complete prerequisite topics first.</p>
        <NeonButton href="/skill-tree" color="cyan">Back to Skill Tree</NeonButton>
      </div>
    );
  }

  // Extract edge cases from sections
  const edgeCaseSections = topic.sections.filter((s) => s.type === 'edge-case');
  const edgeCases = edgeCaseSections.map((s) => ({
    question: s.title,
    answer: s.content,
    code: s.codeBlocks?.[0]?.code,
  }));

  // Find side-by-side section
  const sideBySide = topic.sections.find((s) => s.type === 'side-by-side');

  // Find code walkthrough sections
  const codeWalkthroughs = topic.sections.filter(
    (s) => (s.type === 'code-walkthrough' || s.type === 'deep-dive') && s.codeBlocks && s.codeBlocks.length > 0
  );

  // Concept sections
  const conceptSections = topic.sections.filter((s) => s.type === 'concept');

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        className="max-w-4xl mx-auto px-6 pt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8">
          <a
            href="/skill-tree"
            className="font-mono text-xs transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5A1F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
          >
            Skill Tree
          </a>
          <span style={{ color: '#D1D5DB' }}>/</span>
          <span className="font-mono text-xs" style={{ color: '#6B7280' }}>{topic.title}</span>
        </nav>

        {/* Title */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#1A1A1A' }}>
            <span className="mr-3">{topic.icon}</span>
            {topic.title}
          </h1>
          <p className="text-base" style={{ color: '#6B7280' }}>{topic.subtitle}</p>
        </div>

        <div className="space-y-14">
          {/* 1. Story Intro */}
          <StoryIntro
            storyDay={topic.storyDay}
            storyIntro={topic.storyIntro}
            kitchenMetaphor={topic.kitchenMetaphor}
            icon={topic.icon}
          />

          {/* 2. 3D Concept Scene */}
          <ConceptScene slug={slug} />

          {/* 3. Concept sections with quick checks */}
          {conceptSections.map((section, i) => (
            <div key={section.id}>
              <div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                  {section.title}
                </h2>
                <div
                  className="text-base leading-7"
                  style={{ color: '#374151' }}
                >
                  {renderMarkdown(section.content)}
                </div>
              </div>
              {/* Quick check after first concept section */}
              {i === 0 && topic.quickChecks && topic.quickChecks[0] && (
                <div className="mt-8">
                  <QuickCheck check={topic.quickChecks[0]} />
                </div>
              )}
            </div>
          ))}

          {/* 4. Code Walkthroughs */}
          {codeWalkthroughs.map((section) => (
            <div key={section.id}>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                {section.title}
              </h2>
              {section.content && (
                <p className="text-sm mb-5" style={{ color: '#6B7280' }}>{section.content}</p>
              )}
              <div className="space-y-6">
                {section.codeBlocks?.map((cb) => (
                  <CodePlayground key={cb.id} codeBlock={cb} />
                ))}
              </div>
            </div>
          ))}

          {/* 4b. What Happens Next — interactive stepper */}
          {topic.whatHappensNext && (
            <WhatHappensNext exercise={topic.whatHappensNext} />
          )}

          {/* Quick check #2 */}
          {topic.quickChecks && topic.quickChecks[1] && (
            <QuickCheck check={topic.quickChecks[1]} />
          )}

          {/* 5. Side-by-side */}
          {sideBySide && (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                {sideBySide.title}
              </h2>
              {sideBySide.codeBlocks && sideBySide.codeBlocks.length >= 2 ? (
                <SideBySideCode
                  oldLabel={sideBySide.codeBlocks[0].label}
                  oldCode={sideBySide.codeBlocks[0].code}
                  newLabel={sideBySide.codeBlocks[1].label}
                  newCode={sideBySide.codeBlocks[1].code}
                />
              ) : (
                <p className="text-sm" style={{ color: '#6B7280' }}>{sideBySide.content}</p>
              )}
            </div>
          )}

          {/* 6. Edge Cases */}
          {edgeCases.length > 0 && <EdgeCaseSection edgeCases={edgeCases} />}

          {/* Divider */}
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #E5E5E3, transparent)' }} />

          {/* 7. Interview Question */}
          <InterviewQuestion
            question={topic.interviewQuestion}
            onViewed={() => markInterviewQViewed(slug)}
          />

          {/* 7b. Fill the Keyword — interactive exercise */}
          {topic.fillKeyword && (
            <FillKeyword exercise={topic.fillKeyword} />
          )}

          {/* 8. Code Puzzle */}
          <CodePuzzle
            puzzle={topic.codePuzzle}
            onScore={(score) => recordPuzzleScore(slug, score)}
          />

          {/* Divider */}
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #E5E5E3, transparent)' }} />

          {/* 9. Mark Complete */}
          <MarkCompleteButton
            slug={slug}
            isCompleted={topicProgress?.status === 'completed'}
          />
        </div>
      </motion.div>
    </div>
  );
}
