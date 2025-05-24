import * as PIXI from 'pixi.js';

const SLIDING_HEIGHT = 395;

export default class Slider extends PIXI.Container {
  constructor() {
    super();

    this.interactive = true;
    this.buttonMode = true;
    this.eventMode = 'static';

    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);
    this._bg
      .roundRect(-750, -255, 830, 400+SLIDING_HEIGHT, 30)
      .fill({color: 0x00ff00, alpha: 0})

    this._sliderButton = new PIXI.Graphics();
    this.addChild(this._sliderButton);
    this._sliderButton
      .roundRect(-58, -83, 116, 166, 50)
      .fill(0xdec583)
      .rect(-58, -83, 51, 166)
      .fill(0)
      .roundRect(-40, -65, 80, 130, 30)
      .fill(0xa83300)
      .stroke({color: 0x000000, width: 14})
      .moveTo(-20, -10)
      .lineTo(20, -10)
      .moveTo(-20, 10)
      .lineTo(20, 10)
      .stroke({color: 0x000000, width: 8})


    this.on('pointerdown', this._onDragStart.bind(this));
    this.on('pointerup', this._onDragEnd.bind(this));
    this.on('pointerupoutside', this._onDragEnd.bind(this));
    this.on('pointermove', this._onDragMove.bind(this));

    this._dragging = false;
    this._startY = 0;
    this._startButtonY = 0;
  }

  _onDragStart(event) {
    this._dragging = true;
    this._startY = event.data.global.y;
    this._startButtonY = this._sliderButton.y;
  }

  _onDragEnd() {
    this._dragging = false;
  }

  _onDragMove(event) {
    if (!this._dragging) return;

    // Get the local position of the cursor relative to the slider
    const localY = event.data.getLocalPosition(this).y;
    
    // Constrain the slider within bounds
    const newY = Math.max(0, Math.min(SLIDING_HEIGHT, localY));
    this._sliderButton.y = newY;

    const percent = newY / SLIDING_HEIGHT;
    this.emit('sliderMove', percent);
  }
}