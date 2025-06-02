export const DEFAULT_STATE = {
  version: 4,
  timestamp: Date.now(),
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
};

export const STORAGE_KEY = "gameState";

export const VALID_PHASES = ['date', 'news', 'customer', 'trader'];

export const PURCHASABLE_ITEMS = [
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
];

export const USABLE_ITEMS = ['special']; 