'use client';

import { useSyncExternalStore, useCallback } from 'react';

// Server snapshot - always returns false for consistent SSR
function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  // Subscribe to media query changes
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
    [query]
  );

  // Get current snapshot on client
  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  // useSyncExternalStore handles SSR/hydration correctly:
  // - Uses getServerSnapshot during SSR (returns false)
  // - Uses getSnapshot on client after hydration
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
