import { useBalance } from '../useBalance';

describe('useBalance Hook', () => {
  let mockState;
  let mockSetState;
  let balanceHook;

  beforeEach(() => {
    mockState = {
      balance: 100
    };
    mockSetState = jest.fn();
    balanceHook = useBalance(mockState, mockSetState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeBalance function', () => {
    test('exists and is a function', () => {
      expect(typeof balanceHook.changeBalance).toBe('function');
    });

    test('increases balance with positive delta', () => {
      balanceHook.changeBalance(50);

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));

      // Test the setState callback
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 100 });
      
      expect(newState).toEqual({
        balance: 150
      });
    });

    test('decreases balance with negative delta', () => {
      balanceHook.changeBalance(-30);

      expect(mockSetState).toHaveBeenCalledTimes(1);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 100 });
      
      expect(newState).toEqual({
        balance: 70
      });
    });

    test('handles zero delta', () => {
      balanceHook.changeBalance(0);

      expect(mockSetState).toHaveBeenCalledTimes(1);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 100 });
      
      expect(newState).toEqual({
        balance: 100
      });
    });

    test('preserves other state properties', () => {
      const prevState = {
        balance: 100,
        otherProperty: 'test',
        nested: { value: 42 }
      };

      balanceHook.changeBalance(25);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);
      
      expect(newState).toEqual({
        balance: 125,
        otherProperty: 'test',
        nested: { value: 42 }
      });
    });

    test('handles large positive numbers', () => {
      balanceHook.changeBalance(1000000);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 100 });
      
      expect(newState.balance).toBe(1000100);
    });

    test('handles large negative numbers', () => {
      balanceHook.changeBalance(-1000000);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 100 });
      
      expect(newState.balance).toBe(-999900);
    });

    test('handles decimal numbers', () => {
      balanceHook.changeBalance(25.75);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 100.25 });
      
      expect(newState.balance).toBe(126);
    });

    test('multiple balance changes work correctly', () => {
      // First change
      balanceHook.changeBalance(50);
      expect(mockSetState).toHaveBeenCalledTimes(1);
      
      // Second change
      balanceHook.changeBalance(-20);
      expect(mockSetState).toHaveBeenCalledTimes(2);
      
      // Test both callbacks
      const firstCallback = mockSetState.mock.calls[0][0];
      const secondCallback = mockSetState.mock.calls[1][0];
      
      const firstResult = firstCallback({ balance: 100 });
      const secondResult = secondCallback({ balance: 150 });
      
      expect(firstResult.balance).toBe(150);
      expect(secondResult.balance).toBe(130);
    });

    test('handles balance starting at zero', () => {
      balanceHook.changeBalance(10);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: 0 });
      
      expect(newState.balance).toBe(10);
    });

    test('handles negative starting balance', () => {
      balanceHook.changeBalance(30);
      
      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback({ balance: -50 });
      
      expect(newState.balance).toBe(-20);
    });
  });

  describe('Hook structure', () => {
    test('returns object with correct methods', () => {
      expect(balanceHook).toEqual({
        changeBalance: expect.any(Function)
      });
    });

    test('returns same function reference on multiple calls', () => {
      const firstHook = useBalance(mockState, mockSetState);
      const secondHook = useBalance(mockState, mockSetState);
      
      // Functions should be different instances but same structure
      expect(typeof firstHook.changeBalance).toBe('function');
      expect(typeof secondHook.changeBalance).toBe('function');
    });
  });
}); 