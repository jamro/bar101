import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import StoryTree from "./StoryTree";
import DragAndPinchHandler from "./DragAndPinchHandler";
import NodePreview from './NodePreview';
import { Howl } from 'howler';

class StoryTreeMasterContainer extends MasterContainer {
  constructor() {
    super();

    this._clickSound = new Howl({
      src: ['/audio/click.mp3'],
      loop: false,
      volume: 0.3,
    });

    this._masterContainer = new PIXI.Container();
    this.addChild(this._masterContainer);
    this._bg = new PIXI.Graphics();
    this._masterContainer.addChild(this._bg);
    this._enableTimeTravel = false;

    this._zoomContainer = new PIXI.Container();
    this._masterContainer.addChild(this._zoomContainer);

    this._storyTree = new StoryTree();
    this._targetStoryTreePosition = {x: 0, y: 0};
    this._targetScale = 1;
    this._currentScale = 1;
    this._zoomContainer.addChild(this._storyTree);
    
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
      if(this._nodePreview) {
        this._nodePreviewContainer.removeChild(this._nodePreview);
        this._nodePreview = null;
        this._clickSound.play();
      }   
      else {  
        this.emit('close');
        this._clickSound.play();
      }
    });
    this.addChild(this._closeLabel);
    this.addChild(this._closeButton);

    this._nodePreviewContainer = new PIXI.Container();
    this.addChild(this._nodePreviewContainer);
    this._nodePreview = null

    this._dragAndPinchHandler = new DragAndPinchHandler(this._masterContainer, {
      onDrag: (dx, dy) => {
        this._targetStoryTreePosition.x += dx/this._zoomContainer.scale.x;
        this._targetStoryTreePosition.y += dy/this._zoomContainer.scale.y;
      },
      onPinch: (zoomFactor) => {
        this._targetScale = Math.max(0.1, Math.min(5, this._targetScale * zoomFactor));
      },
      onClick: (x, y) => {
        let node = null;
        if(!this._nodePreview) {
          const translatedX1 = (x - this._masterContainer.x) / this._masterContainer.scale.x;
          const translatedY1 = (y - this._masterContainer.y) / this._masterContainer.scale.y;
          const translatedX2 = (translatedX1 - this._storyTree.x*this._zoomContainer.scale.x) / this._zoomContainer.scale.x;
          const translatedY2 = (translatedY1 - this._storyTree.y*this._zoomContainer.scale.y) / this._zoomContainer.scale.y;

          node = this._storyTree.selectNodeAt(translatedX2, translatedY2);
        } else {
          this._nodePreviewContainer.removeChild(this._nodePreview);
          this._nodePreview = null;
          this._clickSound.play();
        }
        if(node) {
          this.showNodePreview(node)
          this._clickSound.play();
        }
      }
    });

    this._renderLoop = null;
  }

  showNodePreview(node) {
    this._nodePreview = new NodePreview(node);
    this._nodePreview.enableTimeTravel(this._enableTimeTravel);
    this._nodePreview.on('openChapter', () => {
      this.emit('openChapter', node.path);
      this._clickSound.play();
    });
    this._nodePreviewContainer.addChild(this._nodePreview);
    this._nodePreview.show();
    this._targetStoryTreePosition.x = -node.x * this._currentScale / this._zoomContainer.scale.x;
    this._targetStoryTreePosition.y = -node.y * this._currentScale / this._zoomContainer.scale.y;
  }

  enableTimeTravel(enable) {
    this._enableTimeTravel = enable;
    if(this._nodePreview) {
      this._nodePreview.enableTimeTravel(enable);
    }
  }

  _update() {
    this._storyTree.x += (this._targetStoryTreePosition.x - this._storyTree.x) * 0.2;
    this._storyTree.y += (this._targetStoryTreePosition.y - this._storyTree.y) * 0.2;
    
    this._currentScale += (this._targetScale - this._currentScale) * 0.3;
    this._zoomContainer.scale.set(this._currentScale);
    this._storyTree.update()
  }

  init() {
    this._closeButton.interactive = true;
    this._closeButton.cursor = 'pointer';
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

    if(this._nodePreview) {
      this._nodePreviewContainer.removeChild(this._nodePreview);
      this._nodePreview = null;
    }
  }

  updateVisitedNodes(visitedNodes) {
    this._storyTree.updateVisitedNodes(visitedNodes);
  }

  updateStoryPath(storyPath, showNodePreview=false) {
    this._storyTree.updateStoryPath(storyPath);
    this._targetStoryTreePosition.x = -this._storyTree.currentNode?.x || 0;
    this._targetStoryTreePosition.y = -this._storyTree.currentNode?.y || 0;
    if(showNodePreview && this._storyTree.currentNode) {
      setTimeout(() => {
        this.showNodePreview(this._storyTree.currentNode);
      }, 500);
    }
  }

  resize(width, height) {
    const scale = Math.min(width / 1000, height / 1000);

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

    this._nodePreviewContainer.x = width / 2;
    this._nodePreviewContainer.y = height / 2;
    this._nodePreviewContainer.scale.set(scale);
  }
}

StoryTreeMasterContainer.instance = null;

StoryTreeMasterContainer.getInstance = () => {
  if(!StoryTreeMasterContainer.instance) {
    StoryTreeMasterContainer.instance = new StoryTreeMasterContainer();
  }
  return StoryTreeMasterContainer.instance;
}

export default StoryTreeMasterContainer;