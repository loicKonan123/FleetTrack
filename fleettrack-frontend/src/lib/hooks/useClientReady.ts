'use client';

import { useState, useEffect } from 'react';

// Global flag - becomes true once any component has mounted
let globalIsReady = false;
const listeners: Set<() => void> = new Set();

function setGlobalReady() {
  if (!globalIsReady) {
    globalIsReady = true;
    listeners.forEach((listener) => listener());
  }
}

/**
 * Hook that returns true when the client is ready (post-hydration)
 * Uses a global flag so the ready state is shared across all hooks
 * This means only the first hook triggers a re-render, subsequent hooks are instant
 */
export function useClientReady(): boolean {
  const [isReady, setIsReady] = useState(globalIsReady);

  useEffect(() => {
    if (globalIsReady) {
      setIsReady(true);
      return;
    }

    // Set global ready immediately
    setGlobalReady();
    setIsReady(true);

    // Listen for changes (in case another component sets it first)
    const listener = () => setIsReady(true);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return isReady;
}
