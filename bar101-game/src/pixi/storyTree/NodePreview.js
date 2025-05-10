import * as PIXI from 'pixi.js';

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

export default class NodePreview extends PIXI.Container {
  constructor(node) {
    super();

    this.interactive = true;

    this._node = node;

    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);
    this._bg
      .roundRect(-450, 100, 900, 200, 30)
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

    this._labelBg = new PIXI.Graphics();
    this.addChild(this._labelBg);
    this._labelBg
      .roundRect(-450+14, 100+14, 900-28, 200-28, 30)
      .fill(0x000000)
      
    this._label = new PIXI.Text({
      text: this._node.path,
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 50,
        fill: 0xffffff,
        align: 'center',
      }
    })
    this._label.anchor.set(0.5);
    this._label.x = 0;
    this._label.y = 215;
    this.addChild(this._label);

    this._chapterLabel = new PIXI.Text({
      text: "CHAPTER II",
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 30,
        fill: COLOR,
        align: 'center',
      }
    })
    this._chapterLabel.anchor.set(0.5);
    this._chapterLabel.x = 0;
    this._chapterLabel.y = 155;
    this.addChild(this._chapterLabel);

    this._button = new PIXI.Container();
    this._button.y = 260;
    this.addChild(this._button);
    const buttonBg = new PIXI.Graphics();
    this._button.addChild(buttonBg);
    buttonBg.roundRect(-200, 0, 400, 120, 30)
      .fill(0xa83300)
      .stroke({color: 0, width: 14})

    const buttonLabel = new PIXI.Text({
      text: "Open Chapter >",
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 30,
        fill: 0,
        align: 'center',
      }
    })
    buttonLabel.anchor.set(0.5);
    buttonLabel.x = 0;
    buttonLabel.y = 60;
    this._button.addChild(buttonLabel);

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
    this._chapterLabel.text = ""
    const loop = () => {
      this.scale.set(this.scale.x + 0.05);
      if(this.scale.x < 1) {
        requestAnimationFrame(loop);
      }
    }
    loop();
  }

  async _loadNodeData() {
    const nodeFile = `/story/node_${this._node.path}.json`;
    console.log("Loading node data from", nodeFile);
    const response = await fetch(nodeFile);
    const data = await response.json();
    this._label.text = data.title;
    const imgId = data.news.official[0].image_id
    const imgUrl = `/story/news/${imgId}.jpg`
    this._chapterLabel.text = `CHAPTER ${intToRoman(this._node.path.length)}`
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