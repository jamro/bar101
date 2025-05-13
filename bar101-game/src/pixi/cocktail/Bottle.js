import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';


const assetConfigs = {
  rum: {
    texture: 'img/bottle_rum.png',
    x: 0,
    yShift: 390,
    scale: 0.75*2,
  },
  simple_syrup: {
    texture: 'img/bottle_simple_syrup.png',
    x: 0,
    yShift: 360,
    scale: 0.65*2,
  },
  whiskey: {
    texture: 'img/bottle_whiskey.png',
    x: 0,
    yShift: 400,
    scale: 0.68*2,
  },
  gin: {
    texture: 'img/bottle_gin.png',
    x: 0,
    yShift: 365,
    scale: 0.65*2,
  },
  triple_sec: {
    texture: 'img/bottle_triple_sec.png',
    x: 0,
    yShift: 340,
    scale: 0.60*2,
  },
  vermouth: {
    texture: 'img/bottle_vermouth.png',
    x: 0,
    yShift: 375,
    scale: 0.65*2,
  },
  lime_juice: {
    texture: 'img/bottle_lime_juice.png',
    x: 0,
    yShift: 410,
    scale: 0.75*2,
  },
  absinthe: {
    texture: 'img/bottle_absinthe.png',
    x: 0,
    yShift: 350,
    scale: 0.65*2,
  },
}

export default class Bottle extends PIXI.Container {

  constructor(id) {
    super();
    this.id = id;

    const assetConfig = assetConfigs[id] || assetConfigs['rum'];

    this._yShift = assetConfig.yShift;
    this._graphics = new PIXI.Sprite(GameAssets.assets[assetConfig.texture]);
    this._graphics.scale.set(assetConfigs[id].scale);
    this._graphics.anchor.set(0.5, 0);
    this._graphics.x = assetConfig.x
    this._graphics.y = -this._yShift;
    this.addChild(this._graphics);
    this.interactive = true;
    this.buttonMode = true;
    this.interactiveChildren = true;

    if(!assetConfigs[id]) {
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