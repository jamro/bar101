import { useState, useEffect } from 'react';

const DEFAULT_STATE = {
  version: 2,
  timestamp: Date.now(),
  customerTrust: null,
  storyPath: []
}

const ITEM_KEY = "gameState";

const useGameState = () => {
  const [state, setState] = useState(() => {
    const savedRaw = localStorage.getItem(ITEM_KEY);
    const saved = savedRaw ? JSON.parse(savedRaw) : DEFAULT_STATE;
    return saved.version === DEFAULT_STATE.version ? saved : DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(ITEM_KEY, JSON.stringify(state));
  }, [state]);

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
    proceedStoryPath: (decision) => {
      setState((prevState) => ({
        ...prevState,
        timestamp: Date.now(), // setting new timestamp to flush changes to localStorage
        storyPath: [...prevState.storyPath, decision]
      }));
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
    }
  }
};

export default useGameState;