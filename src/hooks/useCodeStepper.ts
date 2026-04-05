'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CodeStep } from '@/types/topic';

export function useCodeStepper(steps: CodeStep[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = steps[currentIndex] ?? null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  const totalSteps = steps.length;

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, steps.length - 1)));
  }, [steps.length]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    if (isLast) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(next, 2000);
    return () => clearTimeout(timer);
  }, [isPlaying, isLast, next, currentIndex]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      else if (e.key === 'Escape') setIsPlaying(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, togglePlay]);

  return {
    currentStep,
    currentIndex,
    totalSteps,
    isFirst,
    isLast,
    isPlaying,
    next,
    prev,
    goTo,
    reset,
    togglePlay,
  };
}
