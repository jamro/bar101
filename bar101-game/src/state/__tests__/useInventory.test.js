import { useInventory } from '../useInventory';
import { PURCHASABLE_ITEMS, USABLE_ITEMS } from '../constants';

// Mock console.log to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
};

describe('useInventory Hook', () => {
  let mockState;
  let mockSetState;
  let inventoryHook;

  beforeEach(() => {
    mockState = {
      inventory: {
        special: 2,
        antenna: false,
        scanner: false,
        timemachine: false,
        files: ['lkova', 'olintz']
      },
      balance: 100
    };
    mockSetState = jest.fn();
    inventoryHook = useInventory(mockState, mockSetState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buyItem function', () => {
    test('buys special item correctly', () => {
      inventoryHook.buyItem('special', 25);

      expect(mockSetState).toHaveBeenCalledTimes(1);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toEqual({
        inventory: {
          special: 3, // Incremented from 2
          antenna: false,
          scanner: false,
          timemachine: false,
          files: ['lkova', 'olintz']
        },
        balance: 75 // 100 - 25
      });
    });

    test('buys antenna item correctly', () => {
      inventoryHook.buyItem('antenna', 50);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.inventory.antenna).toBe(true);
      expect(newState.balance).toBe(50);
    });

    test('buys scanner item correctly', () => {
      inventoryHook.buyItem('scanner', 30);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.inventory.scanner).toBe(true);
      expect(newState.balance).toBe(70);
    });

    test('buys timemachine item correctly', () => {
      inventoryHook.buyItem('timemachine', 100);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.inventory.timemachine).toBe(true);
      expect(newState.balance).toBe(0);
    });

    test('buys file item correctly', () => {
      inventoryHook.buyItem('rmiskovic', 20);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.inventory.files).toEqual(['lkova', 'olintz', 'rmiskovic']);
      expect(newState.balance).toBe(80);
    });

    test('prevents duplicate file purchases', () => {
      inventoryHook.buyItem('lkova', 15); // Already owned

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.inventory.files).toEqual(['lkova', 'olintz']); // No duplicate
      expect(newState.balance).toBe(85);
    });

    test('buys all file types correctly', () => {
      const fileItems = ['dtomenko', 'npetrak', 'shalek'];
      
      fileItems.forEach((file, index) => {
        inventoryHook.buyItem(file, 10);
        
        const setStateCallback = mockSetState.mock.calls[index][0];
        const newState = setStateCallback({
          ...mockState,
          inventory: {
            ...mockState.inventory,
            files: [...mockState.inventory.files, ...fileItems.slice(0, index)]
          }
        });

        expect(newState.inventory.files).toContain(file);
      });
    });

    test('throws error for unknown item', () => {
      expect(() => {
        inventoryHook.buyItem('unknownItem', 10);
      }).toThrow('Unknown item to buy: unknownItem');

      expect(mockSetState).not.toHaveBeenCalled();
    });

    test('throws error for item not in PURCHASABLE_ITEMS', () => {
      expect(() => {
        inventoryHook.buyItem('invalidItem', 5);
      }).toThrow('Unknown item to buy: invalidItem');
    });

    test('handles zero price purchase', () => {
      inventoryHook.buyItem('special', 0);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.inventory.special).toBe(3);
      expect(newState.balance).toBe(100); // No change
    });

    test('handles negative price (refund scenario)', () => {
      inventoryHook.buyItem('special', -10);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.balance).toBe(110); // Increased
    });

    test('preserves other state properties', () => {
      const prevState = {
        ...mockState,
        otherProperty: 'test',
        customerTrust: { player1: 0.5 }
      };

      inventoryHook.buyItem('antenna', 25);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.otherProperty).toBe('test');
      expect(newState.customerTrust).toEqual({ player1: 0.5 });
    });

    test('buying multiple special items increments correctly', () => {
      // First purchase
      inventoryHook.buyItem('special', 10);
      let setStateCallback = mockSetState.mock.calls[0][0];
      let newState = setStateCallback(mockState);
      expect(newState.inventory.special).toBe(3);

      // Second purchase
      inventoryHook.buyItem('special', 15);
      setStateCallback = mockSetState.mock.calls[1][0];
      newState = setStateCallback({ ...mockState, inventory: { ...mockState.inventory, special: 3 } });
      expect(newState.inventory.special).toBe(4);
    });

    test('buying boolean items when already true maintains true', () => {
      const stateWithAntenna = {
        ...mockState,
        inventory: {
          ...mockState.inventory,
          antenna: true
        }
      };

      inventoryHook.buyItem('antenna', 20);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithAntenna);

      expect(newState.inventory.antenna).toBe(true); // Still true
      expect(newState.balance).toBe(80); // Price still deducted
    });
  });

  describe('useItem function', () => {
    test('uses special item correctly', () => {
      inventoryHook.useItem('special');

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Using item:', 'special');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState).toEqual({
        inventory: {
          special: 1, // Decremented from 2
          antenna: false,
          scanner: false,
          timemachine: false,
          files: ['lkova', 'olintz']
        },
        balance: 100
      });
    });

    test('using special item does not go below zero', () => {
      const stateWithOneSpecial = {
        ...mockState,
        inventory: {
          ...mockState.inventory,
          special: 1
        }
      };

      inventoryHook.useItem('special');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithOneSpecial);

      expect(newState.inventory.special).toBe(0);
    });

    test('using special item when count is zero stays at zero', () => {
      const stateWithZeroSpecial = {
        ...mockState,
        inventory: {
          ...mockState.inventory,
          special: 0
        }
      };

      inventoryHook.useItem('special');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(stateWithZeroSpecial);

      expect(newState.inventory.special).toBe(0); // Math.max(0-1, 0) = 0
    });

    test('throws error for unknown usable item', () => {
      expect(() => {
        inventoryHook.useItem('antenna');
      }).toThrow('Unknown item to use: antenna');

      expect(mockSetState).not.toHaveBeenCalled();
    });

    test('throws error for item not in USABLE_ITEMS', () => {
      expect(() => {
        inventoryHook.useItem('nonUsableItem');
      }).toThrow('Unknown item to use: nonUsableItem');
    });

    test('preserves other state properties when using item', () => {
      const prevState = {
        ...mockState,
        balance: 150,
        otherProperty: 'preserved'
      };

      inventoryHook.useItem('special');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(prevState);

      expect(newState.balance).toBe(150);
      expect(newState.otherProperty).toBe('preserved');
      expect(newState.inventory.special).toBe(1);
    });

    test('multiple uses of special item work correctly', () => {
      // First use
      inventoryHook.useItem('special');
      let setStateCallback = mockSetState.mock.calls[0][0];
      let newState = setStateCallback(mockState);
      expect(newState.inventory.special).toBe(1);

      // Second use
      inventoryHook.useItem('special');
      setStateCallback = mockSetState.mock.calls[1][0];
      newState = setStateCallback({ ...mockState, inventory: { ...mockState.inventory, special: 1 } });
      expect(newState.inventory.special).toBe(0);

      // Third use (should stay at 0)
      inventoryHook.useItem('special');
      setStateCallback = mockSetState.mock.calls[2][0];
      newState = setStateCallback({ ...mockState, inventory: { ...mockState.inventory, special: 0 } });
      expect(newState.inventory.special).toBe(0);
    });
  });

  describe('Hook structure', () => {
    test('returns object with correct methods', () => {
      expect(inventoryHook).toEqual({
        buyItem: expect.any(Function),
        useItem: expect.any(Function)
      });
    });
  });

  describe('Integration with constants', () => {
    test('all PURCHASABLE_ITEMS can be purchased', () => {
      PURCHASABLE_ITEMS.forEach(item => {
        expect(() => {
          inventoryHook.buyItem(item, 10);
        }).not.toThrow();
      });
    });

    test('all USABLE_ITEMS can be used', () => {
      USABLE_ITEMS.forEach(item => {
        expect(() => {
          inventoryHook.useItem(item);
        }).not.toThrow();
      });
    });

    test('only items in USABLE_ITEMS can be used', () => {
      const nonUsableItems = PURCHASABLE_ITEMS.filter(item => !USABLE_ITEMS.includes(item));
      
      nonUsableItems.forEach(item => {
        expect(() => {
          inventoryHook.useItem(item);
        }).toThrow(`Unknown item to use: ${item}`);
      });
    });
  });

  describe('Edge cases', () => {
    test('buying with very large price', () => {
      inventoryHook.buyItem('special', 1000000);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.balance).toBe(-999900);
    });

    test('buying with negative balance state', () => {
      const negativeBalanceState = {
        ...mockState,
        balance: -50
      };

      inventoryHook.buyItem('special', 10);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(negativeBalanceState);

      expect(newState.balance).toBe(-60);
    });

    test('using item with very high special count', () => {
      const highSpecialState = {
        ...mockState,
        inventory: {
          ...mockState.inventory,
          special: 1000000
        }
      };

      inventoryHook.useItem('special');

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(highSpecialState);

      expect(newState.inventory.special).toBe(999999);
    });

    test('file array handles complex file names', () => {
      const complexFileName = 'file-with-special_chars.123';
      
      // Note: This would only work if the item was in PURCHASABLE_ITEMS
      // For this test, we'll use an existing file item but verify array behavior
      inventoryHook.buyItem('dtomenko', 10);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(Array.isArray(newState.inventory.files)).toBe(true);
      expect(newState.inventory.files).toContain('dtomenko');
    });

    test('buying files with empty files array', () => {
      const emptyFilesState = {
        ...mockState,
        inventory: {
          ...mockState.inventory,
          files: []
        }
      };

      inventoryHook.buyItem('lkova', 15);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(emptyFilesState);

      expect(newState.inventory.files).toEqual(['lkova']);
    });

    test('preserves inventory structure when buying equipment', () => {
      inventoryHook.buyItem('scanner', 30);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      // All other inventory properties should be preserved
      expect(newState.inventory.special).toBe(2);
      expect(newState.inventory.antenna).toBe(false);
      expect(newState.inventory.scanner).toBe(true);
      expect(newState.inventory.timemachine).toBe(false);
      expect(newState.inventory.files).toEqual(['lkova', 'olintz']);
    });

    test('decimal price handling', () => {
      inventoryHook.buyItem('special', 25.75);

      const setStateCallback = mockSetState.mock.calls[0][0];
      const newState = setStateCallback(mockState);

      expect(newState.balance).toBe(74.25);
    });
  });

  describe('State consistency', () => {
    test('multiple operations maintain state consistency', () => {
      // Buy some items
      inventoryHook.buyItem('antenna', 30);
      inventoryHook.buyItem('special', 20);
      inventoryHook.useItem('special');

      expect(mockSetState).toHaveBeenCalledTimes(3);

      // Simulate the sequence of state changes
      let currentState = mockState;
      
      // Apply first operation
      let callback = mockSetState.mock.calls[0][0];
      currentState = callback(currentState);
      expect(currentState.inventory.antenna).toBe(true);
      expect(currentState.balance).toBe(70);

      // Apply second operation
      callback = mockSetState.mock.calls[1][0];
      currentState = callback(currentState);
      expect(currentState.inventory.special).toBe(3);
      expect(currentState.balance).toBe(50);

      // Apply third operation
      callback = mockSetState.mock.calls[2][0];
      currentState = callback(currentState);
      expect(currentState.inventory.special).toBe(2);
      expect(currentState.balance).toBe(50); // Unchanged by use
    });
  });
}); 