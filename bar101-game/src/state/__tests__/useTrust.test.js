import { useTrust } from '../useTrust';

describe('useTrust Hook', () => {
  let mockState;
  let mockSetState;
  let mockUpdateTimestamp;
  let trustHook;

  beforeEach(() => {
    mockState = {
      customerTrust: {
        player1: 0.5,
        player2: -0.3,
        player3: 0.8
      }
    };
    mockSetState = jest.fn();
    mockUpdateTimestamp = jest.fn(() => 1234567890);
    trustHook = useTrust(mockState, mockSetState, mockUpdateTimestamp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initAllCustomersTrust function', () => {
    test('initializes trust when customerTrust is null', () => {
      const customers = {
        player1: 0.2,
        player2: 0.7,
        player3: -0.1
      };

      trustHook.initAllCustomersTrust(customers);

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ customerTrust: null });

      expect(newState).toEqual({
        timestamp: 1234567890,
        customerTrust: customers
      });
    });

    test('preserves existing trust when customerTrust exists', () => {
      const customers = {
        player1: 0.9,
        player4: 0.1
      };

      trustHook.initAllCustomersTrust(customers);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust).toEqual(mockState.customerTrust);
      expect(newState.timestamp).toBe(1234567890);
    });

    test('handles empty customers object', () => {
      const customers = {};

      trustHook.initAllCustomersTrust(customers);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ customerTrust: null });

      expect(newState.customerTrust).toEqual({});
    });

    test('preserves other state properties', () => {
      const prevState = {
        customerTrust: null,
        balance: 100,
        otherProperty: 'test'
      };
      const customers = { player1: 0.5 };

      trustHook.initAllCustomersTrust(customers);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState).toEqual({
        timestamp: 1234567890,
        customerTrust: customers,
        balance: 100,
        otherProperty: 'test'
      });
    });
  });

  describe('changeTrust function', () => {
    test('increases trust for existing customer', () => {
      trustHook.changeTrust('player1', 0.3);

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player1).toBe(0.8);
      expect(newState.customerTrust.player2).toBe(-0.3);
      expect(newState.customerTrust.player3).toBe(0.8);
    });

    test('decreases trust for existing customer', () => {
      trustHook.changeTrust('player2', -0.5);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player2).toBe(-0.8);
    });

    test('clamps trust at maximum value (1)', () => {
      trustHook.changeTrust('player3', 0.5); // 0.8 + 0.5 = 1.3, should be clamped to 1

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player3).toBe(1);
    });

    test('clamps trust at minimum value (-1)', () => {
      trustHook.changeTrust('player2', -0.8); // -0.3 + (-0.8) = -1.1, should be clamped to -1

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player2).toBe(-1);
    });

    test('creates new customer with trust delta when customer does not exist', () => {
      trustHook.changeTrust('newPlayer', 0.6);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.newPlayer).toBe(0.6);
      expect(newState.customerTrust.player1).toBe(0.5); // Existing customers unchanged
    });

    test('handles zero trust delta', () => {
      trustHook.changeTrust('player1', 0);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player1).toBe(0.5);
    });

    test('handles new customer with negative trust', () => {
      trustHook.changeTrust('negativePlayer', -0.7);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.negativePlayer).toBe(-0.7);
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 100,
        otherProperty: 'test'
      };

      trustHook.changeTrust('player1', 0.2);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(100);
      expect(newState.otherProperty).toBe('test');
      expect(newState.customerTrust.player1).toBe(0.7);
    });

    test('does not include timestamp in changeTrust', () => {
      trustHook.changeTrust('player1', 0.1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.timestamp).toBeUndefined();
    });
  });

  describe('erodeAllCustomersTrust function', () => {
    test('erodes trust for all customers except decision maker', () => {
      trustHook.erodeAllCustomersTrust('player1', 0.8);

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      // Decision maker (player1): (0.5 + 1) * 0.25 - 1 = -0.625
      expect(newState.customerTrust.player1).toBeCloseTo(-0.625);
      
      // Others: (trust + 1) * 0.8 - 1
      // player2: (-0.3 + 1) * 0.8 - 1 = -0.44
      expect(newState.customerTrust.player2).toBeCloseTo(-0.44);
      
      // player3: (0.8 + 1) * 0.8 - 1 = 0.44
      expect(newState.customerTrust.player3).toBeCloseTo(0.44);
    });

    test('uses default erosion factor when not provided', () => {
      trustHook.erodeAllCustomersTrust('player2');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      // Default erosion factor is 0.8
      // Decision maker (player2): (-0.3 + 1) * 0.25 - 1 = -0.825
      expect(newState.customerTrust.player2).toBeCloseTo(-0.825);
      
      // Others with 0.8 factor
      // player1: (0.5 + 1) * 0.8 - 1 = 0.2
      expect(newState.customerTrust.player1).toBeCloseTo(0.2);
      
      // player3: (0.8 + 1) * 0.8 - 1 = 0.44
      expect(newState.customerTrust.player3).toBeCloseTo(0.44);
    });

    test('handles decision maker not in customer list', () => {
      trustHook.erodeAllCustomersTrust('nonExistentPlayer', 0.5);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      // All existing customers should be eroded with 0.5 factor
      expect(newState.customerTrust.player1).toBeCloseTo(-0.25); // (0.5 + 1) * 0.5 - 1
      expect(newState.customerTrust.player2).toBeCloseTo(-0.65); // (-0.3 + 1) * 0.5 - 1
      expect(newState.customerTrust.player3).toBeCloseTo(-0.1);  // (0.8 + 1) * 0.5 - 1
    });

    test('handles different erosion factors', () => {
      trustHook.erodeAllCustomersTrust('player1', 0.9);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      // Decision maker gets 0.25 factor
      expect(newState.customerTrust.player1).toBeCloseTo(-0.625);
      
      // Others get 0.9 factor
      expect(newState.customerTrust.player2).toBeCloseTo(-0.37); // (-0.3 + 1) * 0.9 - 1
      expect(newState.customerTrust.player3).toBeCloseTo(0.62);  // (0.8 + 1) * 0.9 - 1
    });

    test('handles empty customer trust object', () => {
      const emptyState = { customerTrust: {} };

      trustHook.erodeAllCustomersTrust('player1');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(emptyState);

      expect(newState.customerTrust).toEqual({});
      expect(newState.timestamp).toBe(1234567890);
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        balance: 100,
        otherProperty: 'test'
      };

      trustHook.erodeAllCustomersTrust('player1');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(100);
      expect(newState.otherProperty).toBe('test');
      expect(newState.timestamp).toBe(1234567890);
    });
  });

  describe('Hook structure', () => {
    test('returns object with correct methods', () => {
      expect(trustHook).toEqual({
        initAllCustomersTrust: expect.any(Function),
        changeTrust: expect.any(Function),
        erodeAllCustomersTrust: expect.any(Function)
      });
    });
  });

  describe('Edge cases', () => {
    test('handles customerTrust being null for changeTrust', () => {
      const nullTrustState = { customerTrust: null };

      trustHook.changeTrust('player1', 0.5);

      const setStateCallback = mockSetState.mock.calls[0][0];
      
      // This should throw because we're trying to spread null
      expect(() => setStateCallback(nullTrustState)).toThrow();
    });

    test('handles very small trust changes', () => {
      trustHook.changeTrust('player1', 0.001);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player1).toBeCloseTo(0.501);
    });

    test('handles very large trust changes', () => {
      trustHook.changeTrust('player1', 100);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.customerTrust.player1).toBe(1); // Clamped to max
    });

    test('erosion with extreme factors', () => {
      trustHook.erodeAllCustomersTrust('player1', 2.0);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      // Even with factor > 1, math should still work
      expect(typeof newState.customerTrust.player2).toBe('number');
      expect(typeof newState.customerTrust.player3).toBe('number');
    });
  });
}); 