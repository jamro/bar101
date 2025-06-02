import * as PIXI from 'pixi.js';
import MasterContainer from '../pixi/MasterContainer';

describe('MasterContainer Pixi Component', () => {
  let container;

  beforeEach(() => {
    container = new MasterContainer();
  });

  afterEach(() => {
    if (container) {
      container.destroy();
    }
  });

  test('creates instance successfully', () => {
    expect(container).toBeInstanceOf(MasterContainer);
    expect(container).toBeInstanceOf(PIXI.Container);
  });

  test('initializes with correct default state', () => {
    expect(container.initialized).toBe(false);
    expect(container.children.length).toBe(0);
  });

  test('doInit sets initialized flag', () => {
    expect(container.initialized).toBe(false);
    
    container.doInit();
    
    expect(container.initialized).toBe(true);
  });

  test('doInit calls init method only once', () => {
    const initSpy = jest.spyOn(container, 'init');
    
    container.doInit();
    container.doInit(); // Call again
    
    expect(initSpy).toHaveBeenCalledTimes(1);
    
    initSpy.mockRestore();
  });

  test('init method exists and can be called', () => {
    expect(typeof container.init).toBe('function');
    expect(() => container.init()).not.toThrow();
  });

  test('restore method exists and can be called', () => {
    expect(typeof container.restore).toBe('function');
    expect(() => container.restore()).not.toThrow();
  });

  test('resize method exists and can be called', () => {
    expect(typeof container.resize).toBe('function');
    expect(() => container.resize(800, 600)).not.toThrow();
  });

  test('behaves as PIXI.Container', () => {
    // Test basic PIXI.Container functionality
    const childContainer = new PIXI.Container();
    
    container.addChild(childContainer);
    expect(container.children.length).toBe(1);
    
    container.removeChild(childContainer);
    expect(container.children.length).toBe(0);
    
    childContainer.destroy();
  });

  test('maintains state through operations', () => {
    container.doInit();
    expect(container.initialized).toBe(true);
    
    // Add some children
    const child1 = new PIXI.Graphics();
    const child2 = new PIXI.Graphics();
    
    container.addChild(child1);
    container.addChild(child2);
    
    expect(container.children.length).toBe(2);
    expect(container.initialized).toBe(true); // State should persist
    
    // Clean up
    child1.destroy();
    child2.destroy();
  });
}); 