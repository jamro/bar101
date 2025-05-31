export default class PixiApplicationCache {
  constructor(maxSize = 10) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      // Update access time for LRU
      this.accessOrder.set(key, Date.now());
      return item;
    }
    return null;
  }

  set(key, app) {
    // If cache is full, remove least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this._evictLRU();
    }
    
    this.cache.set(key, app);
    this.accessOrder.set(key, Date.now());
  }

  delete(key) {
    const app = this.cache.get(key);
    if (app) {
      try {
        app.destroy();
      } catch (error) {
        console.warn(`[PixiCache] Error destroying app for key ${key}:`, error);
      }
      this.cache.delete(key);
      this.accessOrder.delete(key);
    }
  }

  clear() {
    this.cache.forEach((app, key) => {
      try {
        app.destroy();
      } catch (error) {
        console.warn(`[PixiCache] Error destroying app for key ${key}:`, error);
      }
    });
    this.cache.clear();
    this.accessOrder.clear();
  }

  _evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      console.log(`[PixiCache] Evicting LRU cache entry: ${oldestKey}`);
      this.delete(oldestKey);
    }
  }

  size() {
    return this.cache.size;
  }

  has(key) {
    return this.cache.has(key);
  }
}