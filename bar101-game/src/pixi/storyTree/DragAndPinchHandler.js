import * as PIXI from 'pixi.js';

class DragAndPinchHandler {
  constructor(container, options = {}) {
    this.container = container;
    this.onDrag = options.onDrag || (() => {});
    this.onPinch = options.onPinch || (() => {});
    this.onClick = options.onClick || (() => {});
    
    this._dragPoint = null;
    this._lastPinchDistance = null;
    this._isPinching = false;
    this._clickStartTime = null;
    this._clickStartPosition = null;
    this._clickThreshold = 20; // pixels
    this._clickTimeThreshold = 1000; // milliseconds

    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Configure container for touch
    this.container.eventMode = 'static';
    this.container.interactive = true;
    this.container.interactiveChildren = true;

    // handle drag
    this.container.on('pointerdown', (event) => {
      if (this._isPinching) return;
      this._dragPoint = {x: event.global.x, y: event.global.y};
      this._clickStartTime = Date.now();
      this._clickStartPosition = {x: event.global.x, y: event.global.y};
    });

    this.container.on('pointerup', (event) => {
      if (this._clickStartTime && this._clickStartPosition) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this._clickStartTime;
        const distance = Math.hypot(
          event.global.x - this._clickStartPosition.x,
          event.global.y - this._clickStartPosition.y
        );

        if (timeDiff <= this._clickTimeThreshold && distance <= this._clickThreshold) {
          this.onClick(event.global.x, event.global.y);
        }
      }
      this._dragPoint = null;
      this._clickStartTime = null;
      this._clickStartPosition = null;
    });

    this.container.on('pointerout', () => {
      this._dragPoint = null;
      this._clickStartTime = null;
      this._clickStartPosition = null;
    });

    this.container.on('pointermove', (event) => {
      if(!this._dragPoint || this._isPinching) {
        return;
      }
      const dx = event.global.x - this._dragPoint.x;
      const dy = event.global.y - this._dragPoint.y;
      this._dragPoint.x = event.global.x;
      this._dragPoint.y = event.global.y;
      this.onDrag(dx, dy);
    });

    // Add wheel event for zoom
    this.container.on('wheel', (event) => {
      const zoomFactor = event.deltaY > 0 ? 0.97 : 1.03;
      this.onPinch(zoomFactor);
    });

    // Touch events for pinch zoom
    this.container.on('touchstart', (event) => {
      const touches = event.data.originalEvent.touches;
      if (touches && touches.length === 2) {
        this._isPinching = true;
        this._dragPoint = null;
        const touch1 = touches[0];
        const touch2 = touches[1];
        this._lastPinchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    });

    this.container.on('touchmove', (event) => {
      const touches = event.data.originalEvent.touches;
      if (touches && touches.length === 2) {
        this._isPinching = true;
        this._dragPoint = null;
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (this._lastPinchDistance) {
          const zoomFactor = currentDistance / this._lastPinchDistance;
          this.onPinch(zoomFactor);
        }
        this._lastPinchDistance = currentDistance;
      }
    });

    this.container.on('touchend', (event) => {
      const touches = event.data.originalEvent.touches;
      if (!touches || touches.length < 2) {
        this._isPinching = false;
        this._lastPinchDistance = null;
      }
    });

    this.container.on('touchcancel', () => {
      this._isPinching = false;
      this._lastPinchDistance = null;
    });

    // Add global touch event listeners
    document.addEventListener('touchstart', this._handleGlobalTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this._handleGlobalTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this._handleGlobalTouchEnd.bind(this), { passive: false });
  }

  _handleGlobalTouchStart(event) {
    if (event.touches.length === 2) {
      this._isPinching = true;
      this._dragPoint = null;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this._lastPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  }

  _handleGlobalTouchMove(event) {
    if (event.touches.length === 2 && this._isPinching) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (this._lastPinchDistance) {
        const zoomFactor = currentDistance / this._lastPinchDistance;
        this.onPinch(zoomFactor);
      }
      this._lastPinchDistance = currentDistance;
    }
  }

  _handleGlobalTouchEnd(event) {
    if (event.touches.length < 2) {
      this._isPinching = false;
      this._lastPinchDistance = null;
    }
  }

  cleanup() {
    document.removeEventListener('touchstart', this._handleGlobalTouchStart);
    document.removeEventListener('touchmove', this._handleGlobalTouchMove);
    document.removeEventListener('touchend', this._handleGlobalTouchEnd);
  }
}

export default DragAndPinchHandler; 