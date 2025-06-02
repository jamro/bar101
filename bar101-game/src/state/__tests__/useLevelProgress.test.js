import { useLevelProgress } from '../useLevelProgress';

describe('useLevelProgress Hook', () => {
  let mockState;
  let mockSetState;
  let mockUpdateTimestamp;
  let levelProgressHook;

  beforeEach(() => {
    mockState = {
      levelProgress: {
        phase: 'date',
        customerIndex: 0,
        decision: null
      }
    };
    mockSetState = jest.fn();
    mockUpdateTimestamp = jest.fn(() => 1234567890);
    levelProgressHook = useLevelProgress(mockState, mockSetState, mockUpdateTimestamp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setLevelPhase function', () => {
    test('updates phase correctly', () => {
      levelProgressHook.setLevelPhase('customer');

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toEqual({
        timestamp: 1234567890,
        levelProgress: {
          phase: 'customer',
          customerIndex: 0,
          decision: null
        }
      });
    });

    test('updates to news phase', () => {
      levelProgressHook.setLevelPhase('news');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.phase).toBe('news');
      expect(newState.timestamp).toBe(1234567890);
    });

    test('updates to trader phase', () => {
      levelProgressHook.setLevelPhase('trader');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.phase).toBe('trader');
    });

    test('preserves other levelProgress properties', () => {
      const stateWithData = {
        levelProgress: {
          phase: 'customer',
          customerIndex: 3,
          decision: 'A'
        }
      };

      levelProgressHook.setLevelPhase('trader');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithData);

      expect(newState.levelProgress).toEqual({
        phase: 'trader',
        customerIndex: 3,
        decision: 'A'
      });
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 100,
        otherProperty: 'test'
      };

      levelProgressHook.setLevelPhase('news');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(100);
      expect(newState.otherProperty).toBe('test');
      expect(newState.levelProgress.phase).toBe('news');
    });

    test('handles setting same phase', () => {
      levelProgressHook.setLevelPhase('date');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.phase).toBe('date');
      expect(newState.timestamp).toBe(1234567890);
    });
  });

  describe('proceedToNextCustomer function', () => {
    test('increments customer index by 1', () => {
      levelProgressHook.proceedToNextCustomer();

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toEqual({
        timestamp: 1234567890,
        levelProgress: {
          phase: 'date',
          customerIndex: 1,
          decision: null
        }
      });
    });

    test('increments from higher customer index', () => {
      const stateWithCustomer5 = {
        levelProgress: {
          phase: 'customer',
          customerIndex: 5,
          decision: 'B'
        }
      };

      levelProgressHook.proceedToNextCustomer();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithCustomer5);

      expect(newState.levelProgress.customerIndex).toBe(6);
      expect(newState.levelProgress.phase).toBe('customer'); // Preserved
      expect(newState.levelProgress.decision).toBe('B'); // Preserved
    });

    test('preserves other levelProgress properties', () => {
      const stateWithDecision = {
        levelProgress: {
          phase: 'trader',
          customerIndex: 2,
          decision: 'A'
        }
      };

      levelProgressHook.proceedToNextCustomer();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithDecision);

      expect(newState.levelProgress).toEqual({
        phase: 'trader',
        customerIndex: 3,
        decision: 'A'
      });
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 150,
        inventory: { special: 2 }
      };

      levelProgressHook.proceedToNextCustomer();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(150);
      expect(newState.inventory).toEqual({ special: 2 });
      expect(newState.levelProgress.customerIndex).toBe(1);
    });

    test('handles multiple successive calls', () => {
      // First call
      levelProgressHook.proceedToNextCustomer();
      expect(mockSetState).toHaveBeenCalledTimes(1);

      // Second call
      levelProgressHook.proceedToNextCustomer();
      expect(mockSetState).toHaveBeenCalledTimes(2);

      // Check both callbacks work correctly
      const firstCallback = mockSetState.mock.calls[0][0];
      const secondCallback = mockSetState.mock.calls[1][0];

      const firstResult = firstCallback(mockState);
      const secondResult = secondCallback({ ...mockState, levelProgress: { ...mockState.levelProgress, customerIndex: 1 } });

      expect(firstResult.levelProgress.customerIndex).toBe(1);
      expect(secondResult.levelProgress.customerIndex).toBe(2);
    });
  });

  describe('setDilemmaDecision function', () => {
    test('sets decision to A', () => {
      levelProgressHook.setDilemmaDecision('A');

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toEqual({
        levelProgress: {
          phase: 'date',
          customerIndex: 0,
          decision: 'A'
        }
      });
    });

    test('sets decision to B', () => {
      levelProgressHook.setDilemmaDecision('B');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.decision).toBe('B');
    });

    test('overwrites existing decision', () => {
      const stateWithDecision = {
        levelProgress: {
          phase: 'customer',
          customerIndex: 2,
          decision: 'A'
        }
      };

      levelProgressHook.setDilemmaDecision('B');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithDecision);

      expect(newState.levelProgress.decision).toBe('B');
    });

    test('preserves other levelProgress properties', () => {
      const stateWithData = {
        levelProgress: {
          phase: 'trader',
          customerIndex: 4,
          decision: null
        }
      };

      levelProgressHook.setDilemmaDecision('A');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithData);

      expect(newState.levelProgress).toEqual({
        phase: 'trader',
        customerIndex: 4,
        decision: 'A'
      });
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 200,
        customerTrust: { player1: 0.5 }
      };

      levelProgressHook.setDilemmaDecision('B');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(200);
      expect(newState.customerTrust).toEqual({ player1: 0.5 });
      expect(newState.levelProgress.decision).toBe('B');
    });

    test('sets decision to null', () => {
      const stateWithDecision = {
        levelProgress: {
          phase: 'customer',
          customerIndex: 1,
          decision: 'A'
        }
      };

      levelProgressHook.setDilemmaDecision(null);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithDecision);

      expect(newState.levelProgress.decision).toBeNull();
    });

    test('handles string decisions', () => {
      levelProgressHook.setDilemmaDecision('custom_decision');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.decision).toBe('custom_decision');
    });

    test('handles numeric decisions', () => {
      levelProgressHook.setDilemmaDecision(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.decision).toBe(1);
    });

    test('does not update timestamp', () => {
      levelProgressHook.setDilemmaDecision('A');

      // setDilemmaDecision should NOT call updateTimestamp
      expect(mockUpdateTimestamp).not.toHaveBeenCalled();
    });
  });

  describe('Hook structure', () => {
    test('returns object with correct methods', () => {
      expect(levelProgressHook).toEqual({
        setLevelPhase: expect.any(Function),
        proceedToNextCustomer: expect.any(Function),
        setDilemmaDecision: expect.any(Function)
      });
    });
  });

  describe('Integration scenarios', () => {
    test('typical game flow: set phase, proceed customer, set decision', () => {
      // Set phase to customer
      levelProgressHook.setLevelPhase('customer');
      expect(mockSetState).toHaveBeenCalledTimes(1);

      // Proceed to next customer
      levelProgressHook.proceedToNextCustomer();
      expect(mockSetState).toHaveBeenCalledTimes(2);

      // Set decision
      levelProgressHook.setDilemmaDecision('A');
      expect(mockSetState).toHaveBeenCalledTimes(3);

      // Check that the functions were called
      expect(mockSetState).toHaveBeenCalledTimes(3);
    });

    test('decision change during same customer', () => {
      levelProgressHook.setDilemmaDecision('A');
      levelProgressHook.setDilemmaDecision('B');

      expect(mockSetState).toHaveBeenCalledTimes(2);
      expect(mockUpdateTimestamp).not.toHaveBeenCalled(); // Decisions don't update timestamp
    });
  });

  describe('Edge cases', () => {
    test('handles undefined phase', () => {
      levelProgressHook.setLevelPhase(undefined);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.levelProgress.phase).toBeUndefined();
    });

    test('handles negative customer index increment', () => {
      const negativeIndexState = {
        levelProgress: {
          phase: 'date',
          customerIndex: -1,
          decision: null
        }
      };

      levelProgressHook.proceedToNextCustomer();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(negativeIndexState);

      expect(newState.levelProgress.customerIndex).toBe(0);
    });

    test('handles very large customer index', () => {
      const largeIndexState = {
        levelProgress: {
          phase: 'date',
          customerIndex: 999999,
          decision: null
        }
      };

      levelProgressHook.proceedToNextCustomer();

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(largeIndexState);

      expect(newState.levelProgress.customerIndex).toBe(1000000);
    });
  });
}); 