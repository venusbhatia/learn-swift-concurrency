'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress, TopicProgress, StreakData } from '@/types/progress';

const today = () => new Date().toISOString().split('T')[0];

function createDefaultTopicProgress(slug: string): TopicProgress {
  return {
    slug,
    status: 'locked',
    timeSpentMs: 0,
    codeStepsCompleted: 0,
    codeStepsTotal: 0,
    puzzleAttempts: 0,
    interviewQViewed: false,
  };
}

function updateStreak(streak: StreakData): StreakData {
  const todayStr = today();
  if (streak.lastActiveDate === todayStr) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const isConsecutive = streak.lastActiveDate === yesterdayStr;
  const newCurrent = isConsecutive ? streak.currentStreak + 1 : 1;

  return {
    currentStreak: newCurrent,
    longestStreak: Math.max(streak.longestStreak, newCurrent),
    lastActiveDate: todayStr,
    activeDates: [...new Set([...streak.activeDates, todayStr])],
  };
}

interface ProgressStore extends UserProgress {
  markTopicAvailable: (slug: string) => void;
  markTopicStarted: (slug: string, totalSteps: number) => void;
  markTopicCompleted: (slug: string) => void;
  recordPuzzleScore: (slug: string, score: number) => void;
  recordTimeSpent: (slug: string, ms: number) => void;
  advanceCodeStep: (slug: string) => void;
  markInterviewQViewed: (slug: string) => void;
  recordActivity: () => void;
  getTopicProgress: (slug: string) => TopicProgress;
  completionPercent: () => number;
  reset: () => void;
}

const initialState: UserProgress = {
  version: 1,
  topics: {},
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    activeDates: [],
  },
  totalTimeSpentMs: 0,
  firstVisit: today(),
  lastVisit: today(),
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      markTopicAvailable: (slug) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          if (existing.status !== 'locked') return state;
          return {
            topics: {
              ...state.topics,
              [slug]: { ...existing, status: 'available' },
            },
          };
        }),

      markTopicStarted: (slug, totalSteps) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          return {
            topics: {
              ...state.topics,
              [slug]: {
                ...existing,
                status: existing.status === 'completed' ? 'completed' : 'in-progress',
                codeStepsTotal: totalSteps,
              },
            },
            streak: updateStreak(state.streak),
            lastVisit: today(),
          };
        }),

      markTopicCompleted: (slug) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          return {
            topics: {
              ...state.topics,
              [slug]: {
                ...existing,
                status: 'completed',
                completedAt: new Date().toISOString(),
              },
            },
            streak: updateStreak(state.streak),
            lastVisit: today(),
          };
        }),

      recordPuzzleScore: (slug, score) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          return {
            topics: {
              ...state.topics,
              [slug]: {
                ...existing,
                puzzleScore: Math.max(existing.puzzleScore ?? 0, score),
                puzzleAttempts: existing.puzzleAttempts + 1,
              },
            },
          };
        }),

      recordTimeSpent: (slug, ms) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          return {
            topics: {
              ...state.topics,
              [slug]: {
                ...existing,
                timeSpentMs: existing.timeSpentMs + ms,
              },
            },
            totalTimeSpentMs: state.totalTimeSpentMs + ms,
          };
        }),

      advanceCodeStep: (slug) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          return {
            topics: {
              ...state.topics,
              [slug]: {
                ...existing,
                codeStepsCompleted: Math.min(
                  existing.codeStepsCompleted + 1,
                  existing.codeStepsTotal
                ),
              },
            },
          };
        }),

      markInterviewQViewed: (slug) =>
        set((state) => {
          const existing = state.topics[slug] || createDefaultTopicProgress(slug);
          return {
            topics: {
              ...state.topics,
              [slug]: { ...existing, interviewQViewed: true },
            },
          };
        }),

      recordActivity: () =>
        set((state) => ({
          streak: updateStreak(state.streak),
          lastVisit: today(),
        })),

      getTopicProgress: (slug) => {
        return get().topics[slug] || createDefaultTopicProgress(slug);
      },

      completionPercent: () => {
        const topics = get().topics;
        const completed = Object.values(topics).filter((t) => t.status === 'completed').length;
        return Math.round((completed / 17) * 100);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'concurrency-kitchen-progress',
      skipHydration: true,
    }
  )
);

