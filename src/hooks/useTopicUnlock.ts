'use client';

import { useProgressStore } from '@/lib/progress-store';
import { topicsMeta } from '@/data/topics';
import type { TopicMeta } from '@/types/topic';

export type NodeStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'coming-soon';

export function useTopicStatus(slug: string): NodeStatus {
  const topics = useProgressStore((s) => s.topics);
  const meta = topicsMeta.find((t) => t.slug === slug);

  if (!meta) return 'locked';
  if (!meta.available) return 'coming-soon';

  const progress = topics[slug];
  if (progress?.status === 'completed') return 'completed';
  if (progress?.status === 'in-progress') return 'in-progress';

  // Check if all prerequisites are completed
  const allPrereqsMet = meta.prerequisiteSlugs.every(
    (prereq) => topics[prereq]?.status === 'completed'
  );

  // First topic (no prereqs) is always available
  if (meta.prerequisiteSlugs.length === 0) return 'available';

  return allPrereqsMet ? 'available' : 'locked';
}

export function useAllTopicStatuses(): Record<string, NodeStatus> {
  const topics = useProgressStore((s) => s.topics);
  const statuses: Record<string, NodeStatus> = {};

  for (const meta of topicsMeta) {
    if (!meta.available) {
      statuses[meta.slug] = 'coming-soon';
      continue;
    }

    const progress = topics[meta.slug];
    if (progress?.status === 'completed') {
      statuses[meta.slug] = 'completed';
      continue;
    }
    if (progress?.status === 'in-progress') {
      statuses[meta.slug] = 'in-progress';
      continue;
    }

    if (meta.prerequisiteSlugs.length === 0) {
      statuses[meta.slug] = 'available';
      continue;
    }

    const allPrereqsMet = meta.prerequisiteSlugs.every(
      (prereq) => topics[prereq]?.status === 'completed'
    );
    statuses[meta.slug] = allPrereqsMet ? 'available' : 'locked';
  }

  return statuses;
}
