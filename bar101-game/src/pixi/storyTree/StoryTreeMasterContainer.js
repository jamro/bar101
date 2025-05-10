import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import StoryTree from "./StoryTree";
import GameAssets from "../GameAssets";

class StoryTreeMasterContainer extends MasterContainer {
  constructor() {
    super();

    this._masterContainer = new PIXI.Container();
    this.addChild(this._masterContainer);
    this._bg = new PIXI.Graphics();
    this._masterContainer.addChild(this._bg);

    this._storyTree = new StoryTree();
    this._targetStoryTreePosition = {x: 0, y: 0};
    this._targetScale = 1;
    this._currentScale = 1;
    this._masterContainer.addChild(this._storyTree);
    
    this._closeLabel = new PIXI.Text({
      text: 'Close X',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 50,
        fill: 0xffffff,
        align: 'center',
        stroke: 0x000000,
        strokeThickness: 4,
      }
    })
    this._closeLabel.anchor.set(1, 0);
    this._closeButton = new PIXI.Graphics();
    this._closeButton.rect(-230, 0, 230, 100).fill(0);
    this._closeButton.alpha = 0;
    this._closeButton.on('pointerdown', () => {
      this.emit('close');
    });
    this.addChild(this._closeLabel);
    this.addChild(this._closeButton);

    this._dragPoint = null;
    this._lastPinchDistance = null;
    this._isPinching = false;

    // Configure container for touch
    this._masterContainer.eventMode = 'static';
    this._masterContainer.interactive = true;
    this._masterContainer.interactiveChildren = true;

    // handle drag
    this._masterContainer.on('pointerdown', (event) => {
      if (this._isPinching) return;
      this._dragPoint = {x: event.global.x, y: event.global.y};
    });

    this._masterContainer.on('pointerup', () => {
      this._dragPoint = null;
    });

    this._masterContainer.on('pointerout', () => {
      this._dragPoint = null;
    });

    this._masterContainer.on('pointermove', (event) => {
      if(!this._dragPoint || this._isPinching) {
        return;
      }
      const dx = event.global.x - this._dragPoint.x;
      const dy = event.global.y - this._dragPoint.y;
      this._dragPoint.x = event.global.x;
      this._dragPoint.y = event.global.y;
      this._targetStoryTreePosition.x += dx;
      this._targetStoryTreePosition.y += dy;
    });

    // Add wheel event for zoom
    this._masterContainer.on('wheel', (event) => {
      const zoomFactor = event.deltaY > 0 ? 0.97 : 1.03;
      this._targetScale = Math.max(0.1, Math.min(5, this._targetScale * zoomFactor));
    });

    // Touch events for pinch zoom
    this._masterContainer.on('touchstart', (event) => {
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

    this._masterContainer.on('touchmove', (event) => {
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
          this._targetScale = Math.max(0.1, Math.min(5, this._targetScale * zoomFactor));
        }
        this._lastPinchDistance = currentDistance;
      }
    });

    this._masterContainer.on('touchend', (event) => {
      const touches = event.data.originalEvent.touches;
      if (!touches || touches.length < 2) {
        this._isPinching = false;
        this._lastPinchDistance = null;
      }
    });

    this._masterContainer.on('touchcancel', () => {
      this._isPinching = false;
      this._lastPinchDistance = null;
    });

    // Add global touch event listeners
    document.addEventListener('touchstart', this._handleGlobalTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this._handleGlobalTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this._handleGlobalTouchEnd.bind(this), { passive: false });

    this._renderLoop = null;
  }

  _handleGlobalTouchStart(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
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
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (this._lastPinchDistance) {
        const zoomFactor = currentDistance / this._lastPinchDistance;
        this._targetScale = Math.max(0.1, Math.min(5, this._targetScale * zoomFactor));
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

  _update() {
    this._storyTree.x += (this._targetStoryTreePosition.x - this._storyTree.x) * 0.1;
    this._storyTree.y += (this._targetStoryTreePosition.y - this._storyTree.y) * 0.1;
    
    this._currentScale += (this._targetScale - this._currentScale) * 0.1;
    this._storyTree.scale.set(this._currentScale);
  }

  init() {
    this._closeButton.interactive = true;
    this._closeButton.buttonMode = true;
    this._masterContainer.interactive = true;
    this._masterContainer.interactiveChildren = true;

    this._storyTree.x = 0;
    this._storyTree.y = 0;
    this._targetStoryTreePosition.x = -this._storyTree.currentNode?.x || 0;
    this._targetStoryTreePosition.y = -this._storyTree.currentNode?.y || 0;
    this._targetScale = 1;
    this._currentScale = 1;
    this._isPinching = false;
    this._lastPinchDistance = null;
    this._dragPoint = null;

    if(this._renderLoop) {
      clearInterval(this._renderLoop);
    }
    this._renderLoop = setInterval(() => this._update(), 1000 / 60);
  }
  
  restore() {
    this.cleanUp();
    this.init();
  }

  cleanUp() {
    if(this._renderLoop) {
      clearInterval(this._renderLoop);
      this._renderLoop = null;
    }
  }

  updateVisitedNodes(visitedNodes) {
    this._storyTree.updateVisitedNodes(visitedNodes);
  }

  updateStoryPath(storyPath) {
    this._storyTree.updateStoryPath(storyPath);
    this._targetStoryTreePosition.x = -this._storyTree.currentNode?.x || 0;
    this._targetStoryTreePosition.y = -this._storyTree.currentNode?.y || 0;
  }


  resize(width, height) {
    const scale = Math.max(width / 1600, height / 1600);

    this._closeLabel.x = width-20*scale
    this._closeLabel.y = 20*scale;
    this._closeButton.x = width;
    this._closeButton.y = 0;


    this._closeButton.scale.set(scale);
    this._closeLabel.scale.set(scale);

    this._bg.clear();
    this._bg.rect(-width / 2, -height / 2, width, height).fill(0x000000);
    this._masterContainer.x = width / 2;
    this._masterContainer.y = height / 2;
    this._masterContainer.scale.set(scale*2);
  }
}

export default StoryTreeMasterContainer;