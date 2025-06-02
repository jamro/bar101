import { useEffect } from 'react';
import { DEFAULT_STATE, STORAGE_KEY } from './constants';

export const usePersistence = (state, setState) => {
  // Load initial state from localStorage
  const loadSavedState = () => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) {
        return { ...DEFAULT_STATE, timestamp: Date.now() };
      }
      const saved = JSON.parse(savedRaw);
      if (saved.version === DEFAULT_STATE.version) {
        return { ...saved, timestamp: Date.now() };
      }
      return { ...DEFAULT_STATE, timestamp: Date.now() };
    } catch (error) {
      console.warn('[usePersistence] Error loading saved state:', error);
      return { ...DEFAULT_STATE, timestamp: Date.now() };
    }
  };

  // Save state to localStorage when timestamp changes
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      const saved = savedRaw ? JSON.parse(savedRaw) : null;
      if (!saved || saved.timestamp < state.timestamp) {
        console.log(`[usePersistence] Saving game state to localStorage. Timestamp: ${state.timestamp}`);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        console.log(`[usePersistence] Game state in localStorage is up to date. Timestamp: ${saved.timestamp}`);
      }
    } catch (error) {
      console.warn('[usePersistence] Error parsing saved state in useEffect, saving current state:', error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state.timestamp]);

  const updateTimestamp = () => Date.now();

  return {
    loadSavedState,
    updateTimestamp
  };
}; 