export interface UserProgress {
  version: number;
  topics: Record<string, TopicProgress>;
  streak: StreakData;
  totalTimeSpentMs: number;
  firstVisit: string;
  lastVisit: string;
}

export interface TopicProgress {
  slug: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  completedAt?: string;
  timeSpentMs: number;
  codeStepsCompleted: number;
  codeStepsTotal: number;
  puzzleScore?: number;
  puzzleAttempts: number;
  interviewQViewed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDates: string[];
}
