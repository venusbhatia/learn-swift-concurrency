export const COLORS = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceLight: '#F5F4F1',
  primary: '#FF5A1F',
  accent: '#6366F1',
  primaryDim: 'rgba(255, 90, 31, 0.08)',
  accentDim: 'rgba(99, 102, 241, 0.08)',
  // Legacy aliases for components that still reference old names
  cyan: '#FF5A1F',
  magenta: '#6366F1',
  electric: '#6366F1',
  cyanDim: 'rgba(255, 90, 31, 0.08)',
  magentaDim: 'rgba(99, 102, 241, 0.08)',
  text: '#1A1A1A',
  textDim: '#6B7280',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const TOPIC_SLUGS = [
  'do-catch-try-throws',
  'struct-class-actor',
  'async-await',
  'task',
  'actors',
  'async-let',
  'task-group',
  'checked-continuation',
  'sendable',
  'global-actor',
  'strong-self',
  'mvvm',
  'download-image-async',
  'async-publisher',
  'refreshable',
  'searchable',
  'photo-picker',
] as const;

export type TopicSlug = typeof TOPIC_SLUGS[number];

// Topics available in V1
export const V1_SLUGS: TopicSlug[] = [
  'do-catch-try-throws',
  'struct-class-actor',
  'async-await',
  'task',
  'actors',
  'async-let',
  'task-group',
  'checked-continuation',
  'sendable',
  'global-actor',
  'strong-self',
  'mvvm',
  'download-image-async',
  'async-publisher',
  'refreshable',
  'searchable',
  'photo-picker',
];
