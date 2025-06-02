import { renderHook, act } from '@testing-library/react';
import useGameState from '../useGameState';
import { DEFAULT_STATE } from '../constants';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Set up localStorage mock before any tests run
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});
global.localStorage = localStorageMock;

// Mock console.log to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
};

describe('useGameState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to no saved state
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial state loading', () => {
    test('initializes with DEFAULT_STATE when no saved state', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useGameState());
      
      expect(result.current.gameState).toEqual(expect.objectContaining({
        version: DEFAULT_STATE.version,
        customerTrust: DEFAULT_STATE.customerTrust,
        storyPath: DEFAULT_STATE.storyPath,
        visitedNodes: DEFAULT_STATE.visitedNodes,
        balance: DEFAULT_STATE.balance,
        levelProgress: DEFAULT_STATE.levelProgress,
        inventory: DEFAULT_STATE.inventory
      }));
    });

    test('loads saved state when valid state exists', () => {
      const savedState = { ...DEFAULT_STATE, balance: 200 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const { result } = renderHook(() => useGameState());
      
      // The hook loads the saved state but may update timestamp
      expect(result.current.gameState.balance).toBe(200);
      expect(result.current.gameState.version).toBe(DEFAULT_STATE.version);
    });

    test('falls back to DEFAULT_STATE with wrong version', () => {
      const wrongVersionState = {
        ...DEFAULT_STATE,
        version: 99,
        balance: 500
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(wrongVersionState));
      
      const { result } = renderHook(() => useGameState());
      
      expect(result.current.gameState.balance).toBe(DEFAULT_STATE.balance);
      expect(result.current.gameState.version).toBe(DEFAULT_STATE.version);
    });
  });

  describe('Hook structure', () => {
    test('returns all expected methods', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(result.current).toEqual({
        gameState: expect.any(Object),
        setGameState: expect.any(Function),
        clearGameState: expect.any(Function),
        
        // Trust management
        initAllCustomersTrust: expect.any(Function),
        changeTrust: expect.any(Function),
        erodeAllCusomersTrust: expect.any(Function), // Note: typo in original code
        
        // Story path management
        proceedStoryPath: expect.any(Function),
        visitNode: expect.any(Function),
        resetStoryPath: expect.any(Function),
        openStoryPath: expect.any(Function),
        
        // Level progress management
        setLevelPhase: expect.any(Function),
        proceedToNextCustomer: expect.any(Function),
        setDilemmaDecision: expect.any(Function),
        
        // Balance management
        changeBalance: expect.any(Function),
        
        // Inventory management
        buyItem: expect.any(Function),
        useItem: expect.any(Function)
      });
    });
  });

  describe('clearGameState function', () => {
    test('resets state to DEFAULT_STATE with new timestamp', () => {
      const { result } = renderHook(() => useGameState());
      
      // First modify the state
      act(() => {
        result.current.changeBalance(100);
      });
      
      expect(result.current.gameState.balance).toBe(DEFAULT_STATE.balance + 100);
      
      // Then clear it
      act(() => {
        result.current.clearGameState();
      });
      
      expect(result.current.gameState).toEqual(expect.objectContaining({
        version: DEFAULT_STATE.version,
        customerTrust: DEFAULT_STATE.customerTrust,
        storyPath: DEFAULT_STATE.storyPath,
        visitedNodes: DEFAULT_STATE.visitedNodes,
        balance: DEFAULT_STATE.balance,
        levelProgress: DEFAULT_STATE.levelProgress,
        inventory: DEFAULT_STATE.inventory,
        timestamp: expect.any(Number)
      }));
      
      // Timestamp should be updated
      expect(result.current.gameState.timestamp).toBeGreaterThan(DEFAULT_STATE.timestamp);
    });
  });

  describe('Trust management integration', () => {
    test('initAllCustomersTrust works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      const customers = { player1: 0.5, player2: -0.2 };
      
      act(() => {
        result.current.initAllCustomersTrust(customers);
      });
      
      expect(result.current.gameState.customerTrust).toEqual(customers);
    });

    test('changeTrust works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      // First initialize trust
      act(() => {
        result.current.initAllCustomersTrust({ player1: 0.5 });
      });
      
      // Then change trust
      act(() => {
        result.current.changeTrust('player1', 0.3);
      });
      
      expect(result.current.gameState.customerTrust.player1).toBe(0.8);
    });

    test('erodeAllCusomersTrust works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      // Initialize trust
      act(() => {
        result.current.initAllCustomersTrust({ 
          player1: 0.5, 
          player2: -0.2 
        });
      });
      
      // Erode trust
      act(() => {
        result.current.erodeAllCusomersTrust('player1', 0.8);
      });
      
      // player1 should get harsh penalty as decision maker
      expect(result.current.gameState.customerTrust.player1).toBeCloseTo(-0.625);
      // player2 should get standard erosion: (-0.2 + 1) * 0.8 - 1 = -0.36
      expect(result.current.gameState.customerTrust.player2).toBeCloseTo(-0.36);
    });
  });

  describe('Story path management integration', () => {
    test('proceedStoryPath works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      // Set a decision first
      act(() => {
        result.current.setDilemmaDecision('A');
      });
      
      // Proceed story path
      act(() => {
        result.current.proceedStoryPath();
      });
      
      expect(result.current.gameState.storyPath).toEqual(['A']);
      expect(result.current.gameState.visitedNodes).toContain('xA');
      expect(result.current.gameState.levelProgress.decision).toBeNull();
    });

    test('visitNode works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.visitNode('xABC');
      });
      
      expect(result.current.gameState.visitedNodes).toEqual(
        expect.arrayContaining(['x', 'xA', 'xAB', 'xABC'])
      );
    });

    test('resetStoryPath works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      // First set some story progress
      act(() => {
        result.current.setDilemmaDecision('A');
        result.current.proceedStoryPath();
      });
      
      expect(result.current.gameState.storyPath).toEqual(['A']);
      
      // Reset
      act(() => {
        result.current.resetStoryPath();
      });
      
      expect(result.current.gameState.storyPath).toEqual([]);
      expect(result.current.gameState.levelProgress.phase).toBe('date');
      expect(result.current.gameState.levelProgress.customerIndex).toBe(0);
    });

    test('openStoryPath works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      const newPath = ['X', 'Y', 'Z'];
      
      act(() => {
        result.current.openStoryPath(newPath);
      });
      
      expect(result.current.gameState.storyPath).toEqual(newPath);
      expect(result.current.gameState.levelProgress.phase).toBe('date');
    });
  });

  describe('Level progress management integration', () => {
    test('setLevelPhase works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.setLevelPhase('customer');
      });
      
      expect(result.current.gameState.levelProgress.phase).toBe('customer');
    });

    test('proceedToNextCustomer works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.proceedToNextCustomer();
      });
      
      expect(result.current.gameState.levelProgress.customerIndex).toBe(1);
    });

    test('setDilemmaDecision works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.setDilemmaDecision('B');
      });
      
      expect(result.current.gameState.levelProgress.decision).toBe('B');
    });
  });

  describe('Balance management integration', () => {
    test('changeBalance works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      const initialBalance = result.current.gameState.balance;
      
      act(() => {
        result.current.changeBalance(50);
      });
      
      expect(result.current.gameState.balance).toBe(initialBalance + 50);
      
      act(() => {
        result.current.changeBalance(-20);
      });
      
      expect(result.current.gameState.balance).toBe(initialBalance + 30);
    });
  });

  describe('Inventory management integration', () => {
    test('buyItem works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      const initialBalance = result.current.gameState.balance;
      
      act(() => {
        result.current.buyItem('antenna', 25);
      });
      
      expect(result.current.gameState.inventory.antenna).toBe(true);
      expect(result.current.gameState.balance).toBe(initialBalance - 25);
    });

    test('useItem works correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      // First buy some special items
      act(() => {
        result.current.buyItem('special', 10);
      });
      
      const specialCount = result.current.gameState.inventory.special;
      
      act(() => {
        result.current.useItem('special');
      });
      
      expect(result.current.gameState.inventory.special).toBe(specialCount - 1);
    });
  });

  describe('Complex integration scenarios', () => {
    test('complete game flow scenario', () => {
      const { result } = renderHook(() => useGameState());
      
      // Initialize customers
      act(() => {
        result.current.initAllCustomersTrust({ player1: 0.5, player2: 0.3 });
      });
      
      // Buy some items
      act(() => {
        result.current.buyItem('antenna', 20);
        result.current.buyItem('special', 15);
      });
      
      // Progress through game
      act(() => {
        result.current.setLevelPhase('customer');
        result.current.proceedToNextCustomer();
        result.current.setDilemmaDecision('A');
        result.current.proceedStoryPath();
      });
      
      // Use an item
      act(() => {
        result.current.useItem('special');
      });
      
      // Change trust
      act(() => {
        result.current.changeTrust('player1', 0.2);
      });
      
      const finalState = result.current.gameState;
      
      // Verify all changes are reflected
      expect(finalState.customerTrust.player1).toBe(0.7);
      expect(finalState.inventory.antenna).toBe(true);
      expect(finalState.inventory.special).toBe(DEFAULT_STATE.inventory.special + 1 - 1); // Buy 1, use 1
      expect(finalState.balance).toBe(DEFAULT_STATE.balance - 35); // Spent 20 + 15
      expect(finalState.storyPath).toEqual(['A']); // Only the decision 'A' was made
      expect(finalState.levelProgress.phase).toBe('date'); // Reset after proceeding
      expect(finalState.levelProgress.customerIndex).toBe(0); // Reset after proceeding
      expect(finalState.levelProgress.decision).toBeNull(); // Reset after proceeding
    });

    test('state persistence integration', () => {
      const { result } = renderHook(() => useGameState());
      
      // Make some changes
      act(() => {
        result.current.changeBalance(100);
        result.current.setLevelPhase('trader');
      });
      
      // The persistence hook should have triggered localStorage saves
      // Note: This may not always trigger immediately in tests due to timing
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    test('proceedStoryPath throws error without decision', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(() => {
        act(() => {
          result.current.proceedStoryPath();
        });
      }).toThrow('No decision made yet.');
    });

    test('visitNode throws error for invalid node', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(() => {
        act(() => {
          result.current.visitNode('invalidNode');
        });
      }).toThrow('Invalid nodeId: invalidNode');
    });

    test('buyItem throws error for unknown item', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(() => {
        act(() => {
          result.current.buyItem('unknownItem', 10);
        });
      }).toThrow('Unknown item to buy: unknownItem');
    });

    test('useItem throws error for unknown item', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(() => {
        act(() => {
          result.current.useItem('unknownItem');
        });
      }).toThrow('Unknown item to use: unknownItem');
    });
  });

  describe('State mutations are immutable', () => {
    test('state changes create new objects', () => {
      const { result } = renderHook(() => useGameState());
      
      const originalState = result.current.gameState;
      
      act(() => {
        result.current.changeBalance(10);
      });
      
      const newState = result.current.gameState;
      
      // State should be a new object
      expect(newState).not.toBe(originalState);
      // But unchanged properties should be preserved
      expect(newState.inventory).toBe(originalState.inventory);
      expect(newState.customerTrust).toBe(originalState.customerTrust);
    });

    test('nested object changes create new nested objects', () => {
      const { result } = renderHook(() => useGameState());
      
      const originalInventory = result.current.gameState.inventory;
      
      act(() => {
        result.current.buyItem('antenna', 10);
      });
      
      const newInventory = result.current.gameState.inventory;
      
      // Inventory should be a new object
      expect(newInventory).not.toBe(originalInventory);
      // But files array should be preserved if unchanged
      expect(newInventory.files).toBe(originalInventory.files);
    });
  });

  describe('Type checking and data integrity', () => {
    test('maintains proper data types throughout operations', () => {
      const { result } = renderHook(() => useGameState());
      
      // Perform various operations
      act(() => {
        result.current.changeBalance(50.5);
        result.current.buyItem('special', 10);
        result.current.setDilemmaDecision('A');
        result.current.proceedToNextCustomer();
      });
      
      const state = result.current.gameState;
      
      // Verify types
      expect(typeof state.balance).toBe('number');
      expect(typeof state.inventory.special).toBe('number');
      expect(typeof state.inventory.antenna).toBe('boolean');
      expect(Array.isArray(state.inventory.files)).toBe(true);
      expect(Array.isArray(state.storyPath)).toBe(true);
      expect(Array.isArray(state.visitedNodes)).toBe(true);
      expect(typeof state.levelProgress.customerIndex).toBe('number');
      expect(typeof state.levelProgress.phase).toBe('string');
    });
  });
}); 