import * as PIXI from 'pixi.js';
import TimeTravelButton from './TimeTravelButton';
import TitleBanner from './TitleBanner';

const COLOR = 0xdec583

function intToRoman(num) {
  if (num < 1 || num > 10) {
    return num
  }
  
  const romanNumerals = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X"
  };
  
  return romanNumerals[num];
}

const TITLE_OFFSET = 130

export default class NodePreview extends PIXI.Container {
  constructor(node) {
    super();

    this.interactive = true;

    this._node = node;

    this._label = new TitleBanner()
    

    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);
    this._bg
      .roundRect(-450, TITLE_OFFSET, 900, 200, 30)
      .fill(COLOR)
      .circle(0, 0, 400)
      .fill(0x000000)
      .stroke({color: COLOR, width: 14})

    this._imgContainer = new PIXI.Container();
    this.addChild(this._imgContainer);

    const mask = new PIXI.Graphics();
    mask.circle(0, 0, 400-7).fill(0x0000ff);
    this._imgContainer.mask = mask;
    this.addChild(mask);

    this.addChild(this._label);
    this._label.x = -450+14;
    this._label.y = TITLE_OFFSET+14;

    this._button = new TimeTravelButton()
    this._button.y = TITLE_OFFSET + 160;
    this.addChild(this._button);

    this._button.on('pointerdown', () => {
      this.emit('buttonClick');
    });

    this._button.interactive = true;
    this._button.buttonMode = true;
    this._button.eventMode = 'static';
    this._button.on('pointerdown', () => {
      this.emit('openChapter')
    });

    this.visible = false;
    this._loadNodeData();
  }

  show() {
    this.visible = true;
    this.scale.set(0);
    this._label.text = ""
    this._label.chapterLabel = ""
    const loop = () => {
      this.scale.set(this.scale.x + 0.05);
      if(this.scale.x < 1) {
        requestAnimationFrame(loop);
      }
    }
    loop();
  }

  enableTimeTravel(enable) {
    this._button.visible = enable;
  }

  async _loadNodeData() {
    const nodeFile = `/story/node_${this._node.path}.json`;
    console.log("Loading node data from", nodeFile);
    const response = await fetch(nodeFile);
    const data = await response.json();
    this._label.text = data.title;
    const imgId = data.news.underground[0].image_id
    const imgUrl = `/story/news/${imgId}.jpg`
    this._label.chapterLabel = `CHAPTER ${intToRoman(this._node.path.length)}`
    // load image 
    while(this._imgContainer.children.length > 0) {
      this._imgContainer.removeChild(this._imgContainer.children[0]);
    }
    const imgTexture = await PIXI.Assets.load(imgUrl)
    const imgSprite = new PIXI.Sprite(imgTexture);
    imgSprite.anchor.set(0.5);
    imgSprite.x = 0;
    imgSprite.y = 0;
    imgSprite.scale.set(1.3);
    this._imgContainer.addChild(imgSprite);
  }
}