export interface Topic {
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  prerequisiteSlugs: string[];
  storyDay: number;
  storyIntro: string;
  kitchenMetaphor: string;
  sections: TopicSection[];
  interviewQuestion: InterviewQuestion;
  codePuzzle: CodePuzzle;
  whatHappensNext?: WhatHappensNextExercise;
  fillKeyword?: FillKeywordExercise;
  quickChecks?: QuickCheck[];
}

export interface TopicSection {
  id: string;
  type: 'concept' | 'code-walkthrough' | 'side-by-side' | 'edge-case' | 'deep-dive';
  title: string;
  content: string;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  id: string;
  label: string;
  code: string;
  steps: CodeStep[];
}

export interface CodeStep {
  lineRange: [number, number];
  explanation: string;
  executionNote?: string;
  threadIndicator?: 'main' | 'background' | 'suspended';
}

export interface InterviewQuestion {
  question: string;
  hints: string[];
  answer: string;
  followUps: string[];
}

export interface CodePuzzle {
  type: 'reorder' | 'fill-blank' | 'spot-bug' | 'predict-output';
  prompt: string;
  code: string;
  solution: string;
  options?: string[];
  correctOptionIndex?: number;
  blanks?: PuzzleBlank[];
}

export interface PuzzleBlank {
  lineNumber: number;
  blankId: string;
  correctAnswer: string;
  distractors: string[];
}

// Interactive exercise types
export interface WhatHappensNextStep {
  codeLine: string;
  question: string;
  options: { label: string; emoji: string; isCorrect: boolean }[];
  explanation: string;
}

export interface WhatHappensNextExercise {
  title: string;
  steps: WhatHappensNextStep[];
}

export interface FillKeywordBlank {
  id: string;
  correctAnswer: string;
  distractors: string[];
  hint: string;
}

export interface FillKeywordExercise {
  title: string;
  codeTemplate: string;
  blanks: FillKeywordBlank[];
}

export interface QuickCheck {
  question: string;
  options: [string, string];
  correctIndex: 0 | 1;
  explanation: string;
}

// Lightweight topic entry for the master registry (skill tree, nav)
export interface TopicMeta {
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  prerequisiteSlugs: string[];
  storyDay: number;
  kitchenMetaphor: string;
  available: boolean; // false for "Coming Soon" topics
}
