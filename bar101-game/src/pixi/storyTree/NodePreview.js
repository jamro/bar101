import * as PIXI from 'pixi.js';
import NodeOverview from './NodeOverview';
import BookContent from './BookContent';
import { Howl } from 'howler';

export default class NodePreview extends PIXI.Container {
  constructor(node) {
    super();

    this._node = node;

    this._clickSound = new Howl({
      src: ['/audio/click.mp3'],
      loop: false,
      volume: 0.3,
    });

    this._overview = new NodeOverview(node)
    this.addChild(this._overview)
    this._overview.visible = true;
    
    this._bookContent = new BookContent()
    this.addChild(this._bookContent)
    this._bookContent.visible = false;

    this._overview.on('showBook', () => {
      this.flip(this._overview, this._bookContent)
    })
    this._overview.on('openChapter', () => {
      this.emit('openChapter')
    })
    this._bookContent.on('goBack', () => {
      this.flip(this._bookContent, this._overview)
    })

    this._isFlipping = false;

    this.visible = false;
    this._loadNodeData();
  }

  async flip(from, to) {
    if (this._isFlipping)
      return
    this._isFlipping = true;

    this._clickSound.play();
   
    from.visible = true;
    to.visible = false;

    for(let i = 0; i <= 1; i+=0.2) {
      from.scale.set(1-i, 1);
      await new Promise(resolve => setTimeout(resolve, 16));
    }
    from.visible = false;
    to.visible = true;

    for(let i = 0; i <= 1; i+=0.2) {
      to.scale.set(i, 1);
      await new Promise(resolve => setTimeout(resolve, 16));
    }

    from.scale.set(1, 1);
    to.scale.set(1, 1);

    this._isFlipping = false
  }


  show() {
    this._overview.show();
    this._bookContent.visible = false;
    this._overview.visible = true;
    this.visible = true;
    this.scale.set(0);
    const loop = () => {
      this.scale.set(this.scale.x + 0.05);
      if(this.scale.x < 1) {
        requestAnimationFrame(loop);
      }
    }
    loop();
  }

  enableTimeTravel(enable) {
    this._overview.enableTimeTravel(enable);
  }

  async _loadNodeData() {
    const nodeFile = `/story/node_${this._node.path}.json`;
    console.log("Loading node data from", nodeFile);
    this._overview.loading = true;
    const response = await fetch(nodeFile);
    const data = await response.json();
    this._overview.once('imageLoaded', () => {
      this._overview.loading = false;
    })
    this._overview.updateData(data);
    this._bookContent.updateData(data);
  }
}