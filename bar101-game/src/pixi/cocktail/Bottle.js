import * as PIXI from 'pixi.js';

export default class Bottle extends PIXI.Container {

  constructor(id) {
    super();
    this.id = id;
    this._yShift = 400;
    this._graphics = new PIXI.Graphics();
    this._graphics
      .lineTo(0, 0)
      .lineTo(50, 50)
      .lineTo(50, 400)
      .lineTo(-50, 400)
      .lineTo(-50, 50)
      .lineTo(0, 0)
      .fill(0xFF0000)
    this._graphics.y = -this._yShift;
    this.addChild(this._graphics);
    this.interactive = true;
    this.buttonMode = true;
    this.interactiveChildren = true;

    this.label = new PIXI.Text({
      text: id,
      style: new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 0xFFFFFF,
        align: 'center'
      })
    })
    this.label.anchor.set(0.5);
    this.label.x = 0;
    this.label.y = 200 - this._yShift;
    this.label.rotation = -Math.PI / 2;
    this.addChild(this.label);
  }

  get yShift() {
    return this._yShift;
  }

  get tipX() {
    return this.x + this._yShift*Math.sin(this.rotation);
  }

  get tipY() {
    return this.y - this._yShift*Math.cos(this.rotation);
  }

  set tipX(value) {
    this.x = value - this._yShift*Math.sin(this.rotation);
  }

  set tipY(value) {
    this.y = value + this._yShift*Math.cos(this.rotation);
  }

}