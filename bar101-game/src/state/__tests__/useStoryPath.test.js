import { useStoryPath } from '../useStoryPath';

// Mock console.log to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
};

describe('useStoryPath Hook', () => {
  let mockState;
  let mockSetState;
  let mockUpdateTimestamp;
  let storyPathHook;

  beforeEach(() => {
    mockState = {
      storyPath: [],
      visitedNodes: ['x'],
      levelProgress: {
        phase: 'date',
        customerIndex: 0,
        decision: null
      }
    };
    mockSetState = jest.fn();
    mockUpdateTimestamp = jest.fn(() => 1234567890);
    storyPathHook = useStoryPath(mockState, mockSetState, mockUpdateTimestamp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('proceedStoryPath function', () => {
    test('proceeds with valid decision', () => {
      const stateWithDecision = {
        ...mockState,
        levelProgress: {
          ...mockState.levelProgress,
          decision: 'A'
        }
      };

      storyPathHook.proceedStoryPath();

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithDecision);

      expect(newState).toMatchObject({
        storyPath: ['A'],
        visitedNodes: ['x', 'xA'],
        levelProgress: {
          customerIndex: 0,
          phase: 'date',
          decision: null
        }
      });
      expect(newState.timestamp).toBeDefined();
      expect(console.log).toHaveBeenCalledWith('[useStoryPath] Proceeding story path. Decision: A, Story path: ');
    });

    test('throws error when no decision is made', () => {
      storyPathHook.proceedStoryPath();

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      
      expect(() => {
        setStateCallback(mockState); // mockState has decision: null
      }).toThrow('No decision made yet.');
    });

    test('appends to existing story path', () => {
      const stateWithPath = {
        ...mockState,
        storyPath: ['A', 'B'],
        visitedNodes: ['x', 'xA', 'xAB'],
        levelProgress: {
          ...mockState.levelProgress,
          decision: 'C'
        }
      };

      storyPathHook.proceedStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithPath);

      expect(newState.storyPath).toEqual(['A', 'B', 'C']);
      expect(newState.visitedNodes).toEqual(['x', 'xA', 'xAB', 'xABC']);
      expect(console.log).toHaveBeenCalledWith('[useStoryPath] Proceeding story path. Decision: C, Story path: A-B');
    });

    test('resets level progress after proceeding', () => {
      const stateWithDecision = {
        ...mockState,
        levelProgress: {
          phase: 'customer',
          customerIndex: 3,
          decision: 'B'
        }
      };

      storyPathHook.proceedStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithDecision);

      expect(newState.levelProgress).toEqual({
        customerIndex: 0,
        phase: 'date',
        decision: null
      });
    });

    test('removes duplicate visited nodes', () => {
      const stateWithDuplicates = {
        ...mockState,
        storyPath: ['A'],
        visitedNodes: ['x', 'xA', 'x'], // Duplicate 'x'
        levelProgress: {
          ...mockState.levelProgress,
          decision: 'B'
        }
      };

      storyPathHook.proceedStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithDuplicates);

      expect(newState.visitedNodes).toEqual(['x', 'xA', 'xAB']);
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 100,
        customerTrust: { player1: 0.5 },
        levelProgress: {
          ...mockState.levelProgress,
          decision: 'A'
        }
      };

      storyPathHook.proceedStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(100);
      expect(newState.customerTrust).toEqual({ player1: 0.5 });
    });
  });

  describe('visitNode function', () => {
    test('visits valid node', () => {
      storyPathHook.visitNode('xABC');

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toMatchObject({
        storyPath: [],
        visitedNodes: ['x', 'xA', 'xAB', 'xABC'],
        levelProgress: {
          phase: 'date',
          customerIndex: 0,
          decision: null
        }
      });
      expect(newState.timestamp).toBeDefined();
    });

    test('creates node chain for complex node', () => {
      storyPathHook.visitNode('xABCDE');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.visitedNodes).toEqual([
        'x', 
        'xA', 
        'xAB', 
        'xABC', 
        'xABCD', 
        'xABCDE'
      ]);
    });

    test('removes duplicate nodes when visiting', () => {
      const stateWithNodes = {
        ...mockState,
        visitedNodes: ['x', 'xA', 'xB']
      };

      storyPathHook.visitNode('xABC');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithNodes);

      // Should not have duplicates
      expect(newState.visitedNodes).toEqual(['x', 'xA', 'xB', 'xAB', 'xABC']);
    });

    test('throws error for invalid node (not starting with x)', () => {
      expect(() => {
        storyPathHook.visitNode('ABC');
      }).toThrow('Invalid nodeId: ABC');

      expect(mockSetState).not.toHaveBeenCalled();
    });

    test('throws error for node too long', () => {
      expect(() => {
        storyPathHook.visitNode('xABCDEFGH'); // 9 characters
      }).toThrow('Invalid nodeId: xABCDEFGH');

      expect(mockSetState).not.toHaveBeenCalled();
    });

    test('accepts maximum length node', () => {
      expect(() => {
        storyPathHook.visitNode('xABCDEFG'); // 8 characters - should be OK
      }).not.toThrow();

      expect(mockSetState).toHaveBeenCalled();
    });

    test('handles single character node', () => {
      storyPathHook.visitNode('x');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.visitedNodes).toEqual(['x']); // Already exists, no duplicates
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 200,
        storyPath: ['A', 'B']
      };

      storyPathHook.visitNode('xCD');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(200);
      expect(newState.storyPath).toEqual(['A', 'B']);
    });
  });

  describe('resetStoryPath function', () => {
    test('resets story path and level progress', () => {
      const stateWithProgress = {
        ...mockState,
        storyPath: ['A', 'B', 'C'],
        visitedNodes: ['x', 'xA', 'xAB', 'xABC'],
        levelProgress: {
          phase: 'customer',
          customerIndex: 5,
          decision: 'A'
        }
      };

      storyPathHook.resetStoryPath();

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithProgress);

      expect(newState).toMatchObject({
        storyPath: [],
        visitedNodes: ['x', 'xA', 'xAB', 'xABC'], // Preserved
        levelProgress: {
          phase: 'date',
          customerIndex: 0,
          decision: null
        }
      });
      expect(newState.timestamp).toBeDefined();
    });

    test('works when story path is already empty', () => {
      storyPathHook.resetStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.storyPath).toEqual([]);
      expect(newState.levelProgress).toEqual({
        phase: 'date',
        customerIndex: 0,
        decision: null
      });
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 300,
        customerTrust: { player1: 0.8 },
        storyPath: ['X', 'Y']
      };

      storyPathHook.resetStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(300);
      expect(newState.customerTrust).toEqual({ player1: 0.8 });
      expect(newState.storyPath).toEqual([]);
    });
  });

  describe('openStoryPath function', () => {
    test('sets new story path', () => {
      const newPath = ['X', 'Y', 'Z'];

      storyPathHook.openStoryPath(newPath);

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toMatchObject({
        storyPath: ['X', 'Y', 'Z'],
        visitedNodes: ['x'], // Preserved
        levelProgress: {
          phase: 'date',
          customerIndex: 0,
          decision: null
        }
      });
      expect(newState.timestamp).toBeDefined();
    });

    test('replaces existing story path', () => {
      const stateWithPath = {
        ...mockState,
        storyPath: ['A', 'B'],
        levelProgress: {
          phase: 'trader',
          customerIndex: 3,
          decision: 'C'
        }
      };

      const newPath = ['D', 'E'];

      storyPathHook.openStoryPath(newPath);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithPath);

      expect(newState.storyPath).toEqual(['D', 'E']);
      expect(newState.levelProgress).toEqual({
        phase: 'date',
        customerIndex: 0,
        decision: null
      });
    });

    test('handles empty array path', () => {
      storyPathHook.openStoryPath([]);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.storyPath).toEqual([]);
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 400,
        inventory: { special: 3 }
      };

      storyPathHook.openStoryPath(['M', 'N']);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(400);
      expect(newState.inventory).toEqual({ special: 3 });
      expect(newState.storyPath).toEqual(['M', 'N']);
    });
  });

  describe('Hook structure', () => {
    test('returns object with correct methods', () => {
      expect(storyPathHook).toEqual({
        proceedStoryPath: expect.any(Function),
        visitNode: expect.any(Function),
        resetStoryPath: expect.any(Function),
        openStoryPath: expect.any(Function)
      });
    });
  });

  describe('Integration scenarios', () => {
    test('complete story progression cycle', () => {
      // Start with decision
      const stateWithDecision = {
        ...mockState,
        levelProgress: {
          ...mockState.levelProgress,
          decision: 'A'
        }
      };

      // Proceed story path
      storyPathHook.proceedStoryPath();
      let setStateCallback = mockSetState.mock.calls[0][0];
      let newState = setStateCallback(stateWithDecision);

      expect(newState.storyPath).toEqual(['A']);
      expect(newState.visitedNodes).toEqual(['x', 'xA']);

      // Visit additional node
      storyPathHook.visitNode('xAB');
      setStateCallback = mockSetState.mock.calls[1][0];
      newState = setStateCallback(newState);

      expect(newState.visitedNodes).toEqual(['x', 'xA', 'xAB']);

      // Expect proper call counts
      expect(mockSetState).toHaveBeenCalledTimes(2);
    });

    test('reset after progression', () => {
      // Start with some progress
      const progressedState = {
        ...mockState,
        storyPath: ['A', 'B'],
        levelProgress: {
          phase: 'customer',
          customerIndex: 2,
          decision: 'C'
        }
      };

      // Reset
      storyPathHook.resetStoryPath();
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(progressedState);

      expect(newState.storyPath).toEqual([]);
      expect(newState.levelProgress).toEqual({
        phase: 'date',
        customerIndex: 0,
        decision: null
      });
    });
  });

  describe('Edge cases', () => {
    test('proceedStoryPath with null decision throws error', () => {
      storyPathHook.proceedStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      
      expect(() => {
        setStateCallback({
          ...mockState,
          levelProgress: {
            ...mockState.levelProgress,
            decision: null
          }
        });
      }).toThrow('No decision made yet.');
    });

    test('proceedStoryPath with undefined decision throws error', () => {
      storyPathHook.proceedStoryPath();

      const setStateCallback = mockSetState.mock.calls[0][0];
      
      expect(() => {
        setStateCallback({
          ...mockState,
          levelProgress: {
            ...mockState.levelProgress,
            decision: undefined
          }
        });
      }).toThrow('No decision made yet.');
    });

    test('visitNode with exactly 8 characters works', () => {
      expect(() => {
        storyPathHook.visitNode('x1234567'); // Exactly 8 chars
      }).not.toThrow();
    });

    test('visitNode with empty string after x', () => {
      storyPathHook.visitNode('x');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.visitedNodes).toEqual(['x']); // No change since 'x' already exists
    });

    test('openStoryPath with non-array values', () => {
      storyPathHook.openStoryPath('not an array');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.storyPath).toBe('not an array');
    });

    test('large story path and visited nodes performance', () => {
      const largeVisitedNodes = Array.from({ length: 1000 }, (_, i) => `node${i}`);
      const stateWithLargeNodes = {
        ...mockState,
        visitedNodes: largeVisitedNodes
      };

      expect(() => {
        storyPathHook.visitNode('xABCD');
      }).not.toThrow();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithLargeNodes);

      expect(newState.visitedNodes.length).toBeGreaterThan(1000);
    });
  });
}); 