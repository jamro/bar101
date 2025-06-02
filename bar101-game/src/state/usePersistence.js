import { useEffect } from 'react';
import { DEFAULT_STATE, STORAGE_KEY } from './constants';

export const usePersistence = (state, setState) => {
  // Load initial state from localStorage
  const loadSavedState = () => {
    const savedRaw = localStorage.getItem(STORAGE_KEY);
    const saved = savedRaw ? JSON.parse(savedRaw) : DEFAULT_STATE;
    return saved.version === DEFAULT_STATE.version ? saved : DEFAULT_STATE;
  };

  // Save state to localStorage when timestamp changes
  useEffect(() => {
    const savedRaw = localStorage.getItem(STORAGE_KEY);
    const saved = savedRaw ? JSON.parse(savedRaw) : null;
    if (!saved || saved.timestamp < state.timestamp) {
      console.log(`[usePersistence] Saving game state to localStorage. Timestamp: ${state.timestamp}`);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      console.log(`[usePersistence] Game state in localStorage is up to date. Timestamp: ${saved.timestamp}`);
    }
  }, [state.timestamp]);

  const updateTimestamp = () => Date.now();

  return {
    loadSavedState,
    updateTimestamp
  };
}; 