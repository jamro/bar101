import * as PIXI from 'pixi.js';

export default class Shaker extends PIXI.Container {

  constructor() {
    super();
    this._container = new PIXI.Container();
    this.addChild(this._container);
    this._graphics = new PIXI.Graphics();
    this._graphics
      .lineTo(-50, 0)
      .lineTo(50, 0)
      .lineTo(40, 150)
      .lineTo(-40, 150)
      .lineTo(-50, 0)
      .fill(0xFF0000);
    this._container.addChild(this._graphics);
    this.interactive = true;
    this.buttonMode = true;
    this.interactiveChildren = true;

    this._graphics.y = -this.graphicHeight/2
    this._container.y = -this._graphics.y;

    this._initPos = { x: this._container.x, y: this._container.y };
    this._lastPos = { x: 0, y: 0 };
    this._lastVelocity = 0
    this._shaking = false;
    this._progress = 0;

    this._progressBar = new PIXI.Graphics();
    this._progressBar.alpha = 0;
    this._progressBar.y = this._graphics.height + 20
    this.addChild(this._progressBar);
  }

  get graphicHeight() {
    return this._graphics.height;
  }
  

  resetProgress() {
    this.progress = 0;
  }

  get progress() {
    return this._progress;
  }

  set progress(value) {
    this._progress = value;

    this._progressBar.clear();
    this._progressBar
      .rect(-52, -9, 104, 18)
      .fill(0x000000)
    this._progressBar
      .rect(-50, -7, 100*this.progress, 14)
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
  }

  endShaking() {
    this._shaking = false;
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
  

}