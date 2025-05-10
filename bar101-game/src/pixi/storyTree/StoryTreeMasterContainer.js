import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import StoryTree from "./StoryTree";
import GameAssets from "../GameAssets";
import DragAndPinchHandler from "./DragAndPinchHandler";

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

    this._dragAndPinchHandler = new DragAndPinchHandler(this._masterContainer, {
      onDrag: (dx, dy) => {
        this._targetStoryTreePosition.x += dx;
        this._targetStoryTreePosition.y += dy;
      },
      onPinch: (zoomFactor) => {
        this._targetScale = Math.max(0.1, Math.min(5, this._targetScale * zoomFactor));
      }
    });

    this._renderLoop = null;
  }

  _update() {
    this._storyTree.x += (this._targetStoryTreePosition.x - this._storyTree.x) * 0.2;
    this._storyTree.y += (this._targetStoryTreePosition.y - this._storyTree.y) * 0.2;
    
    this._currentScale += (this._targetScale - this._currentScale) * 0.3;
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
    this._dragAndPinchHandler.cleanup();
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