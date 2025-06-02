import {
  DEFAULT_STATE,
  STORAGE_KEY,
  VALID_PHASES,
  PURCHASABLE_ITEMS,
  USABLE_ITEMS
} from '../constants';

describe('Constants', () => {
  describe('DEFAULT_STATE', () => {
    test('has correct structure', () => {
      expect(DEFAULT_STATE).toEqual({
        version: 4,
        timestamp: expect.any(Number),
        customerTrust: null,
        storyPath: [],
        visitedNodes: ['x'],
        balance: 33,
        levelProgress: {
          phase: 'date',
          customerIndex: 0,
          decision: null,
        },
        inventory: {
          special: 0,
          antenna: false,
          scanner: false,
          timemachine: false,
          files: []
        },
      });
    });

    test('has valid timestamp', () => {
      expect(DEFAULT_STATE.timestamp).toBeGreaterThan(0);
      expect(typeof DEFAULT_STATE.timestamp).toBe('number');
    });

    test('has correct version', () => {
      expect(DEFAULT_STATE.version).toBe(4);
    });

    test('has correct initial balance', () => {
      expect(DEFAULT_STATE.balance).toBe(33);
    });

    test('has correct initial levelProgress', () => {
      expect(DEFAULT_STATE.levelProgress.phase).toBe('date');
      expect(DEFAULT_STATE.levelProgress.customerIndex).toBe(0);
      expect(DEFAULT_STATE.levelProgress.decision).toBeNull();
    });

    test('has correct initial inventory', () => {
      expect(DEFAULT_STATE.inventory.special).toBe(0);
      expect(DEFAULT_STATE.inventory.antenna).toBe(false);
      expect(DEFAULT_STATE.inventory.scanner).toBe(false);
      expect(DEFAULT_STATE.inventory.timemachine).toBe(false);
      expect(DEFAULT_STATE.inventory.files).toEqual([]);
    });

    test('has correct initial story state', () => {
      expect(DEFAULT_STATE.storyPath).toEqual([]);
      expect(DEFAULT_STATE.visitedNodes).toEqual(['x']);
      expect(DEFAULT_STATE.customerTrust).toBeNull();
    });
  });

  describe('STORAGE_KEY', () => {
    test('is correct string', () => {
      expect(STORAGE_KEY).toBe('gameState');
      expect(typeof STORAGE_KEY).toBe('string');
    });
  });

  describe('VALID_PHASES', () => {
    test('contains all expected phases', () => {
      expect(VALID_PHASES).toEqual(['date', 'news', 'customer', 'trader']);
    });

    test('includes date phase', () => {
      expect(VALID_PHASES).toContain('date');
    });

    test('includes news phase', () => {
      expect(VALID_PHASES).toContain('news');
    });

    test('includes customer phase', () => {
      expect(VALID_PHASES).toContain('customer');
    });

    test('includes trader phase', () => {
      expect(VALID_PHASES).toContain('trader');
    });

    test('has correct length', () => {
      expect(VALID_PHASES).toHaveLength(4);
    });
  });

  describe('PURCHASABLE_ITEMS', () => {
    test('contains all expected items', () => {
      expect(PURCHASABLE_ITEMS).toEqual([
        'special',
        'antenna', 
        'scanner',
        'timemachine',
        'lkova',
        'olintz', 
        'rmiskovic',
        'dtomenko',
        'npetrak',
        'shalek'
      ]);
    });

    test('includes inventory items', () => {
      expect(PURCHASABLE_ITEMS).toContain('special');
      expect(PURCHASABLE_ITEMS).toContain('antenna');
      expect(PURCHASABLE_ITEMS).toContain('scanner');
      expect(PURCHASABLE_ITEMS).toContain('timemachine');
    });

    test('includes file items', () => {
      expect(PURCHASABLE_ITEMS).toContain('lkova');
      expect(PURCHASABLE_ITEMS).toContain('olintz');
      expect(PURCHASABLE_ITEMS).toContain('rmiskovic');
      expect(PURCHASABLE_ITEMS).toContain('dtomenko');
      expect(PURCHASABLE_ITEMS).toContain('npetrak');
      expect(PURCHASABLE_ITEMS).toContain('shalek');
    });

    test('has correct length', () => {
      expect(PURCHASABLE_ITEMS).toHaveLength(10);
    });

    test('contains only strings', () => {
      PURCHASABLE_ITEMS.forEach(item => {
        expect(typeof item).toBe('string');
      });
    });
  });

  describe('USABLE_ITEMS', () => {
    test('contains only special item', () => {
      expect(USABLE_ITEMS).toEqual(['special']);
    });

    test('has correct length', () => {
      expect(USABLE_ITEMS).toHaveLength(1);
    });

    test('contains only strings', () => {
      USABLE_ITEMS.forEach(item => {
        expect(typeof item).toBe('string');
      });
    });

    test('special item is also purchasable', () => {
      expect(PURCHASABLE_ITEMS).toContain('special');
    });
  });

  describe('Constants relationships', () => {
    test('default phase is valid', () => {
      expect(VALID_PHASES).toContain(DEFAULT_STATE.levelProgress.phase);
    });

    test('usable items are subset of purchasable items', () => {
      USABLE_ITEMS.forEach(item => {
        expect(PURCHASABLE_ITEMS).toContain(item);
      });
    });
  });
}); 