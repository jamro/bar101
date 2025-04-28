import { useState, useEffect } from 'react';

const DEFAULT_STATE = {
  version: 5,
  timestamp: Date.now(),
  customerTrust: null,
  storyPath: [],
  levelProgress: {
    phase: 'news',
    customerIndex: 0,
    decision: null,
  }
}

const ITEM_KEY = "gameState";

const useGameState = () => {
  const [state, setState] = useState(() => {
    const savedRaw = localStorage.getItem(ITEM_KEY);
    const saved = savedRaw ? JSON.parse(savedRaw) : DEFAULT_STATE;
    return saved.version === DEFAULT_STATE.version ? saved : DEFAULT_STATE;
  });

  useEffect(() => {
    const savedRaw = localStorage.getItem(ITEM_KEY);
    const saved = savedRaw ? JSON.parse(savedRaw) : null;
    if(!saved || saved.timestamp < state.timestamp) {
      console.log(`[useGameState] Saving game state to localStorage. Timestamp: ${state.timestamp}`);
      localStorage.setItem(ITEM_KEY, JSON.stringify(state));
    } else {
      console.log(`[useGameState] Game state in localStorage is up to date. Timestamp: ${saved.timestamp}`);
    }
  }, [state.timestamp]);

  return {
    gameState: state,
    setGameState: setState,
    clearGameState: () => setState({...DEFAULT_STATE, timestamp: Date.now()}),
    initAllCustomersTrust: (customers) => {
      setState((prevState) => ({
        ...prevState,
        timestamp: Date.now(), // setting new timestamp to flush changes to localStorage
        customerTrust: prevState.customerTrust || customers
      }));
    },
    changeTrust(customerId, trustDelta) {
      setState((prevState) => ({
        ...prevState,
        customerTrust: {
          ...prevState.customerTrust,
          [customerId]: Math.min(Math.max((prevState.customerTrust[customerId] || 0) + trustDelta, -1), 1)
        }
      }));
    },
    proceedStoryPath: () => {
      setState((prevState) => {
        if (!prevState.levelProgress.decision) {
          throw new Error("No decision made yet.");
        }
        return {
          ...prevState,
          timestamp: Date.now(), // setting new timestamp to flush changes to localStorage
          storyPath: [...prevState.storyPath, prevState.levelProgress.decision],
          levelProgress: {
            ...prevState.levelProgress,
            customerIndex: 0,
            phase: 'news',
            decision: null
          }
        }
      });
    },
    setLevelPhase: (phase) => {
      setState((prevState) => ({
        ...prevState,
        timestamp: Date.now(), // setting new timestamp to flush changes to localStorage
        levelProgress: {
          ...prevState.levelProgress,
          phase
        }
      }));
    },
    proceedToNextCustomer: () => {
      setState((prevState) => ({
        ...prevState,
        timestamp: Date.now(), // setting new timestamp to flush changes to localStorage
        levelProgress: {
          ...prevState.levelProgress,
          customerIndex: prevState.levelProgress.customerIndex + 1
        }
      }));
    },
    setDilemmaDecision: (decision) => {
      setState((prevState) => ({
        ...prevState,
        levelProgress: {
          ...prevState.levelProgress,
          decision
        }
      }));
    }
  }
};

export default useGameState;