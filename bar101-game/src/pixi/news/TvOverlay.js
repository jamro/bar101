
import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';


export default class TvOverlay extends PIXI.Container {
  constructor() {
    super();

    this._graphic = new PIXI.Sprite(GameAssets.assets['img/tv.jpg']);
    this._graphic.anchor.set(0.5);
    this.addChild(this._graphic);

    this._mask = new PIXI.Graphics();
    this._mask
      .moveTo(-this._graphic.width/2, -this._graphic.height/2)
      // inner area
      .lineTo(-100, -220)
      .lineTo(100, -220)
      .lineTo(200, -218)
      .lineTo(270, -215)
      .lineTo(320, -210)
      .lineTo(332, -202)
      .lineTo(340, -170)
      .lineTo(342, 158)  
      .lineTo(333, 208)  
      .lineTo(325, 215)  
      .lineTo(320, 220)  
      .lineTo(270, 225)  
      .lineTo(100, 230)
      .lineTo(-100, 230)
      .lineTo(-200, 228)
      .lineTo(-310, 220)
      .lineTo(-325, 208)
      .lineTo(-330, 170) 
      .lineTo(-333, 0) 
      .lineTo(-330, -160) 
      .lineTo(-325, -198)  
      .lineTo(-320, -210)
      .lineTo(-200, -218)
      .lineTo(-100, -220)
      // outer area
      .lineTo(-this._graphic.width/2, -this._graphic.height/2)
      .lineTo(-this._graphic.width/2, this._graphic.height/2)
      .lineTo(this._graphic.width/2, this._graphic.height/2)
      .lineTo(this._graphic.width/2, -this._graphic.height/2)
      .fill(0x0000ff)
      .closePath()

    this._graphic.mask = this._mask;
    this.addChild(this._mask);
  }
}