import * as PIXI from 'pixi.js';

/**
 * A reusable component for adding glowing effects to PIXI sprites
 * Handles animation loop, memory management, and cleanup
 */
export default class GlowEffect extends PIXI.Container {
  constructor(texture, options = {}) {
    super();
    
    // Configuration options with defaults
    this.options = {
      x: 0,
      y: 0,
      anchor: { x: 0.5, y: 0.5 },
      scale: 1,
      animationSpeed: 0.005,
      frameRate: 16,
      minAlpha: 0,
      maxAlpha: 1,
      ...options
    };
    
    this._isGlowing = false;
    this._glowingLoop = null;
    this._destroyed = false;
    
    // Create the glow sprite
    this._glow = new PIXI.Sprite(texture);
    this._glow.anchor.set(this.options.anchor.x, this.options.anchor.y);
    this._glow.x = this.options.x;
    this._glow.y = this.options.y;
    this._glow.alpha = 0;
    
    // Apply scale if provided
    if (typeof this.options.scale === 'number') {
      this._glow.scale.set(this.options.scale);
    } else if (this.options.scale && typeof this.options.scale === 'object') {
      this._glow.scale.set(this.options.scale.x || 1, this.options.scale.y || 1);
    }
    
    this.addChild(this._glow);
  }
  
  /**
   * Start or stop the glowing effect
   * @param {boolean} value - Whether to enable glowing
   */
  set glowing(value) {
    if (this._destroyed || this._isGlowing === value) {
      return;
    }
    
    this._isGlowing = value;
    
    // Clear existing interval first to prevent multiple intervals
    this._clearGlowInterval();
    
    if (value) {
      this._glow.alpha = this.options.maxAlpha;
      this._startGlowAnimation();
    } else {
      this._glow.alpha = this.options.minAlpha;
    }
  }
  
  /**
   * Get the current glowing state
   * @returns {boolean} Whether currently glowing
   */
  get glowing() {
    return this._isGlowing;
  }
  
  /**
   * Start the glow animation loop
   * @private
   */
  _startGlowAnimation() {
    this._glowingLoop = setInterval(() => {
      // Safety check: ensure component still exists and is active
      if (this._destroyed || !this._glow || !this._isGlowing) {
        this._clearGlowInterval();
        return;
      }
      
      // Calculate pulsing alpha using sine wave
      const time = Date.now() * this.options.animationSpeed;
      const pulseValue = Math.sin(time) * 0.5 + 0.5; // Normalize to 0-1
      this._glow.alpha = this.options.minAlpha + 
        (pulseValue * (this.options.maxAlpha - this.options.minAlpha));
    }, this.options.frameRate);
  }
  
  /**
   * Clear the glow animation interval
   * @private
   */
  _clearGlowInterval() {
    if (this._glowingLoop) {
      clearInterval(this._glowingLoop);
      this._glowingLoop = null;
    }
  }
  
  /**
   * Update the glow sprite position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    if (this._glow) {
      this._glow.x = x;
      this._glow.y = y;
    }
  }
  
  /**
   * Update the glow sprite scale
   * @param {number|object} scale - Scale value or {x, y} object
   */
  setScale(scale) {
    if (!this._glow) return;
    
    if (typeof scale === 'number') {
      this._glow.scale.set(scale);
    } else if (scale && typeof scale === 'object') {
      this._glow.scale.set(scale.x || 1, scale.y || 1);
    }
  }
  
  /**
   * Update the glow sprite anchor
   * @param {number} x - Anchor X
   * @param {number} y - Anchor Y
   */
  setAnchor(x, y) {
    if (this._glow) {
      this._glow.anchor.set(x, y);
    }
  }
  
  /**
   * Get the glow sprite for direct manipulation if needed
   * @returns {PIXI.Sprite} The glow sprite
   */
  get glowSprite() {
    return this._glow;
  }
  
  /**
   * Clean up resources and stop all animations
   */
  destroy() {
    this._destroyed = true;
    
    // Stop glowing and clear interval
    this._isGlowing = false;
    this._clearGlowInterval();
    
    // Reset alpha
    if (this._glow) {
      this._glow.alpha = 0;
    }
    
    // Call parent destroy
    super.destroy();
  }
} 