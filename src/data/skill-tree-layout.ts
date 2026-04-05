export interface SkillNodePosition {
  slug: string;
  x: number;
  y: number;
  tier: number;
}

export interface SkillEdge {
  from: string;
  to: string;
}

// Positions for 1800x2000 viewBox — big nodes, no clipping, labels above rows
export const skillNodePositions: SkillNodePosition[] = [
  // Tier 1 — Foundation (y=120)
  { slug: 'do-catch-try-throws', x: 580, y: 120, tier: 1 },
  { slug: 'struct-class-actor', x: 1120, y: 120, tier: 1 },

  // Tier 2 — Core Async (y=370)
  { slug: 'async-await', x: 500, y: 370, tier: 2 },
  { slug: 'task', x: 1200, y: 370, tier: 2 },

  // Tier 3 — Parallelism (y=620)
  { slug: 'async-let', x: 310, y: 620, tier: 3 },
  { slug: 'actors', x: 690, y: 620, tier: 3 },
  { slug: 'task-group', x: 1070, y: 620, tier: 3 },
  { slug: 'checked-continuation', x: 1490, y: 620, tier: 3 },

  // Tier 4 — Safety (y=870)
  { slug: 'sendable', x: 400, y: 870, tier: 4 },
  { slug: 'global-actor', x: 850, y: 870, tier: 4 },
  { slug: 'strong-self', x: 1300, y: 870, tier: 4 },

  // Tier 5 — Architecture (y=1120)
  { slug: 'mvvm', x: 850, y: 1120, tier: 5 },

  // Tier 6 — Applied (y=1370)
  { slug: 'download-image-async', x: 580, y: 1370, tier: 6 },
  { slug: 'async-publisher', x: 1120, y: 1370, tier: 6 },

  // Tier 7 — SwiftUI (y=1620)
  { slug: 'refreshable', x: 380, y: 1620, tier: 7 },
  { slug: 'searchable', x: 850, y: 1620, tier: 7 },
  { slug: 'photo-picker', x: 1320, y: 1620, tier: 7 },
];

export const skillEdges: SkillEdge[] = [
  // Tier 1 → 2
  { from: 'do-catch-try-throws', to: 'async-await' },
  { from: 'do-catch-try-throws', to: 'struct-class-actor' },

  // Tier 2 → 3
  { from: 'async-await', to: 'async-let' },
  { from: 'async-await', to: 'task' },
  { from: 'async-await', to: 'checked-continuation' },
  { from: 'task', to: 'actors' },
  { from: 'task', to: 'task-group' },
  { from: 'struct-class-actor', to: 'actors' },

  // Tier 3 → 4
  { from: 'async-let', to: 'task-group' },
  { from: 'actors', to: 'sendable' },
  { from: 'actors', to: 'global-actor' },
  { from: 'task', to: 'strong-self' },

  // Tier 4 → 5
  { from: 'global-actor', to: 'mvvm' },

  // Tier 5 → 6
  { from: 'mvvm', to: 'download-image-async' },
  { from: 'mvvm', to: 'async-publisher' },

  // Tier 6 → 7
  { from: 'download-image-async', to: 'refreshable' },
  { from: 'download-image-async', to: 'searchable' },
  { from: 'async-publisher', to: 'photo-picker' },
];

export function getNodePosition(slug: string): SkillNodePosition | undefined {
  return skillNodePositions.find((n) => n.slug === slug);
}
