import type { Topic } from '@/types/topic';

const topicModules: Record<string, () => Promise<{ default: Topic }>> = {
  'do-catch-try-throws': () => import('./do-catch-try-throws'),
  'struct-class-actor': () => import('./struct-class-actor'),
  'async-await': () => import('./async-await'),
  'task': () => import('./task'),
  'actors': () => import('./actors'),
  'async-let': () => import('./async-let'),
  'task-group': () => import('./task-group'),
  'checked-continuation': () => import('./checked-continuation'),
  'sendable': () => import('./sendable'),
  'global-actor': () => import('./global-actor'),
  'strong-self': () => import('./strong-self'),
  'mvvm': () => import('./mvvm'),
  'download-image-async': () => import('./download-image-async'),
  'async-publisher': () => import('./async-publisher'),
  'refreshable': () => import('./refreshable'),
  'searchable': () => import('./searchable'),
  'photo-picker': () => import('./photo-picker'),
};

export async function getTopicContent(slug: string): Promise<Topic | null> {
  const loader = topicModules[slug];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

export const availableTopicSlugs = Object.keys(topicModules);
