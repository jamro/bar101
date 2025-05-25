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
    this._spinner.moveTo(90, 0)
      .arc(0, 0, 90, 0, Math.PI * 2 * 3 / 4)
      .stroke({color: 0xffffff, width: 28})
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