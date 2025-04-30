import * as PIXI from 'pixi.js';

export default class Bottle extends PIXI.Container {

  constructor(id) {
    super();
    this.id = id;
    this._graphics = new PIXI.Graphics();
    this._graphics
      .rect(0, 0, 100, 200)
      .fill(0xFF0000)
    this.addChild(this._graphics);
    this.interactive = true;
    this.buttonMode = true;
    this.interactiveChildren = true;

    this.label = new PIXI.Text({
      text: id,
      style: new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 30,
        fill: 0xFFFFFF,
        align: 'center'
      })
    })
    this.label.anchor.set(0.5);
    this.label.x = 50;
    this.label.y = 100;
    this.label.rotation = Math.PI / 2;
    this.addChild(this.label);
    
  }

}