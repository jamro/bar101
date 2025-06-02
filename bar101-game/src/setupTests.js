// Jest setup file for React and Pixi.js testing

// Essential imports
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock fetch for Node.js environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock essential Web APIs for Pixi.js
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  terminate: jest.fn(),
}));

// Mock Howler.js for audio tests
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    volume: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
  Howler: {
    volume: jest.fn(),
    mute: jest.fn(),
  },
}));

// Mock essential browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock storage APIs
const createStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
});

global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();

// Mock animation frames
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
}; 