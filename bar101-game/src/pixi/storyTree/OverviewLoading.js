import * as PIXI from 'pixi.js';

export default class OverviewLoading extends PIXI.Container {
  constructor() {
    super();

    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);
    this._bg
      .circle(0, 0, 395)
      .fill(0xa83300)

    this._spinner = new PIXI.Graphics();
    this._spinner.moveTo(90, 0);

    for (let i = 0; i < 32; i++) {
      this._spinner.lineTo(
        90 * Math.cos(0.75 * i * Math.PI * 2 / 32), 
        90 * Math.sin(0.75 * i * Math.PI * 2 / 32)
      )
    }
    this._spinner.stroke({color: 0xffffff, width: 28})

    this.addChild(this._spinner);
    this._spinner.alpha = 0

    this._loop = null;
    this.visible = false;
  }

  start() {
    if (this._loop) {
      return;
    }
    this._spinner.alpha = 0
    this.visible = true;
    this._loop = setInterval(() => {
      this._bg.visible = Math.random() > 0.9;
      this._spinner.rotation += 0.1;
      this._spinner.alpha = Math.min(1, this._spinner.alpha + 0.02);
    }, 16);
  }

  stop() {
    if (!this._loop) {
      return;
    }
    clearInterval(this._loop);
    this._loop = null;
    this.visible = false;
    this._spinner.alpha = 0
  }
}