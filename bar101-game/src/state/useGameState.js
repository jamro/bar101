import { useState } from 'react';
import { DEFAULT_STATE } from './constants';
import { usePersistence } from './usePersistence';
import { useTrust } from './useTrust';
import { useStoryPath } from './useStoryPath';
import { useLevelProgress } from './useLevelProgress';
import { useBalance } from './useBalance';
import { useInventory } from './useInventory';

const useGameState = () => {
  // Initialize state with proper loading logic
  const [state, setState] = useState(() => {
    const savedRaw = localStorage.getItem("gameState");
    const saved = savedRaw ? JSON.parse(savedRaw) : DEFAULT_STATE;
    return saved.version === DEFAULT_STATE.version ? saved : DEFAULT_STATE;
  });

  const { updateTimestamp } = usePersistence(state, setState);
  
  const trustHook = useTrust(state, setState, updateTimestamp);
  const storyPathHook = useStoryPath(state, setState, updateTimestamp);
  const levelProgressHook = useLevelProgress(state, setState, updateTimestamp);
  const balanceHook = useBalance(state, setState);
  const inventoryHook = useInventory(state, setState);

  const clearGameState = () => {
    setState({ ...DEFAULT_STATE, timestamp: updateTimestamp() });
  };

  return {
    gameState: state,
    setGameState: setState,
    clearGameState,
    
    // Trust management
    initAllCustomersTrust: trustHook.initAllCustomersTrust,
    changeTrust: trustHook.changeTrust,
    erodeAllCusomersTrust: trustHook.erodeAllCustomersTrust,
    
    // Story path management
    proceedStoryPath: storyPathHook.proceedStoryPath,
    visitNode: storyPathHook.visitNode,
    resetStoryPath: storyPathHook.resetStoryPath,
    openStoryPath: storyPathHook.openStoryPath,
    
    // Level progress management
    setLevelPhase: levelProgressHook.setLevelPhase,
    proceedToNextCustomer: levelProgressHook.proceedToNextCustomer,
    setDilemmaDecision: levelProgressHook.setDilemmaDecision,
    
    // Balance management
    changeBalance: balanceHook.changeBalance,
    
    // Inventory management
    buyItem: inventoryHook.buyItem,
    useItem: inventoryHook.useItem
  };
};

export default useGameState; 