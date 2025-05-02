import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets.js';

export default class Shaker extends PIXI.Container {

  constructor() {
    super();
    this._container = new PIXI.Container();
    this.addChild(this._container);
    this.interactive = true;
    this.buttonMode = true;
    this.interactiveChildren = true;

    this._container.y = 150/2

    this._initPos = { x: this._container.x, y: this._container.y };
    this._lastPos = { x: 0, y: 0 };
    this._lastVelocity = 0
    this._shaking = false;
    this._progress = 0;

    this._bottom = new PIXI.Sprite(GameAssets.assets['img/shaker_bottom.png']);
    this._bottom.y = 20;
    this._bottom.anchor.set(0.5, 0.5);
    this._container.addChild(this._bottom);

    this._middle = new PIXI.Sprite(GameAssets.assets['img/shaker_middle.png']);
    this._middle.y = -95;
    this._middle.anchor.set(0.5, 0.5);
    this._container.addChild(this._middle);

    this._top = new PIXI.Sprite(GameAssets.assets['img/shaker_top.png']);
    this._top.y = -150;
    this._top.anchor.set(0.5, 0.5);
    this._container.addChild(this._top);

    this._special = new PIXI.Sprite(GameAssets.assets['img/shaker_special.png']);
    this._special.y = 0;
    this._special.anchor.set(0.5, 0.5);
    this._container.addChild(this._special);

    this._progressBar = new PIXI.Graphics();
    this._progressBar.alpha = 0;
    this._progressBar.y = 170
    this.addChild(this._progressBar);
    this._progressLabel = new PIXI.Text({
        text: "Shake it!",
        style: {
          fontFamily: 'Chelsea Market',
          fontSize: 30,
          fill: 0xffffff,
          align: 'center',
        }
      });
    this._progressLabel.anchor.set(0.5, 0.5);
    this._progressLabel.y = 220
    this.addChild(this._progressLabel);
    this._progressLabel.visible = false;

    this.isSpecial = false;
    this.open(2);

  }

  get graphicHeight() {
    return this._bottom.height;
  }
  
  resetProgress() {
    this.progress = 0;
  }

  get progress() {
    return this._progress;
  }

  set progress(value) {
    const progressWidth = 130;
    const progressHeight = 20;
    const progressMargin = 2;

    this._progress = value;

    this._progressBar.clear();
    this._progressBar
      .rect(
        -progressWidth/2 - progressMargin, 
        -progressHeight/2 - progressMargin,
        progressWidth + progressMargin * 2,
        progressHeight + progressMargin * 2)
      .fill(0x000000)
    this._progressBar
      .rect(
        -progressWidth/2, 
        -progressHeight/2, 
        progressWidth*this.progress, 
        progressHeight)
      .fill(this.progress < 1 ? 0xff0000 : 0xffffff)
  }

  get bottleneckWidth() {
    return 100;
  }

  startShaking() {
    this._lastPos.x = this._container.x;
    this._lastPos.y = this._container.y;
    this._shaking = true;
    this._lastVelocity = 0
    this._progressLabel.visible = true;
    this._progressLabel.text = "Shake it!";
    this.open(0);
  }

  endShaking() {
    this._shaking = false;
    if (this._progress >= 1) {
      this.open(1);
    } else {
      this.open(2);
    }
    this._progressLabel.visible = false;
  }

  get shaking() {
    return this._shaking;
  }

  updateShaking(x, y) {
    this._container.x = x - this.x + this._initPos.x;
    this._container.y = y - this.y + this._initPos.y;
    const dx = this._container.x - this._lastPos.x;
    const dy = this._container.y - this._lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const acceleration = Math.abs(distance - this._lastVelocity)
    this._lastVelocity = distance
    if(acceleration > 50) {
      this.progress = Math.min(this._progress + 0.03, 1);
    }

    if( distance > 20) {
      this._container.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    } else {
      this._container.rotation += (0 - this._container.rotation) * 0.1;
    }
    
    this._lastPos.x = this._container.x;
    this._lastPos.y = this._container.y;

    this._progressBar.alpha += (1 - this._progressBar.alpha) * 0.1;
  }

  postShaking() {
    this._container.x += (this._initPos.x - this._container.x) * 0.1;
    this._container.y += (this._initPos.y - this._container.y) * 0.1;
    this._container.rotation += (0 - this._container.rotation) * 0.1;
    this._progressBar.alpha += (0 - this._progressBar.alpha) * 0.1;
  }
  
  open(stage=2) {
    if (stage == 0) {
      this._middle.visible = true;
      this._top.visible = true;
    } else if (stage == 1) {
      this._middle.visible = true;
      this._top.visible = false;
    } else if (stage == 2) {
      this._middle.visible = false;
      this._top.visible = false;
    }
  }

  get isSpecial() {
    return this._special.visible;
  }

  set isSpecial(value) {
    this._special.visible = value;
  }
}