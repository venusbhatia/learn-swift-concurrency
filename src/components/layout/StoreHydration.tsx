'use client';

import { useEffect } from 'react';
import { useProgressStore } from '@/lib/progress-store';

export default function StoreHydration() {
  useEffect(() => {
    useProgressStore.persist.rehydrate();
  }, []);

  return null;
}
