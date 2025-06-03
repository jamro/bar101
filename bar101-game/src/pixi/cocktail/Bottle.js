import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import GlowEffect from '../common/GlowEffect';


const assetConfigs = {
  rum: {
    texture: 'img/bottle_rum.png',
    x: 0,
    yShift: 390,
    scale: 0.75*2,
    glowX: 0,
    glowY: -100,
    glow: true,
  },
  simple_syrup: {
    texture: 'img/bottle_simple_syrup.png',
    x: 0,
    yShift: 360,
    scale: 0.65*2,
    glowX: 0,
    glowY: -80,
    glow: true,
  },
  whiskey: {
    texture: 'img/bottle_whiskey.png',
    x: 0,
    yShift: 400,
    scale: 0.68*2,
    glowX: 0,
    glowY: -85,
    glow: true,
  },
  gin: {
    texture: 'img/bottle_gin.png',
    x: 0,
    yShift: 365,
    scale: 0.65*2,
    glowX: 0,
    glowY: -100,
    glow: true,
  },
  triple_sec: {
    texture: 'img/bottle_triple_sec.png',
    x: 0,
    yShift: 340,
    scale: 0.60*2,
    glowX: 0,
    glowY: -90,
    glow: true,
  },
  vermouth: {
    texture: 'img/bottle_vermouth.png',
    x: 0,
    yShift: 375,
    scale: 0.65*2,
    glowX: 0,
    glowY: -100,
    glow: true,
  },
  lime_juice: {
    texture: 'img/bottle_lime_juice.png',
    x: 0,
    yShift: 410,
    scale: 0.75*2,
    glowX: 0,
    glowY: -100,
    glow: true,
  },
  absinthe: {
    texture: 'img/bottle_absinthe.png',
    x: 0,
    yShift: 350,
    scale: 0.65*2,
    glowX: 0,
    glowY: -100,
    glow: false,
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

    this._glowEffect = null;
    if(assetConfig.glow) {
      const glowTexture = GameAssets.assets[assetConfig.texture.replace('.png', '_glow.png')];
      this._glowEffect = new GlowEffect(glowTexture, {
        x: assetConfig.glowX + assetConfig.x,
        y: assetConfig.glowY - this._yShift,
        anchor: { x: 0.5, y: 0 },
        scale: assetConfigs[id].scale
      });
      this.addChild(this._glowEffect);
    }

    this.interactive = true;
    this.cursor = 'pointer';
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

  get grayedOut() {
    return this.tint !== undefined;
  }

  set grayedOut(value) {
    if(value) {
      this._graphics.tint = 0x333333;
      this.interactive = false;
    } else {
      this._graphics.tint = undefined;
      this.interactive = true;
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

  set glowing(value) {
    if (this._glowEffect) {
      this._glowEffect.glowing = value;
    }
  }

  get glowing() {
    return this._glowEffect ? this._glowEffect.glowing : false;
  }

  destroy() {
    // Clean up glow effect
    if (this._glowEffect) {
      this._glowEffect.destroy();
      this._glowEffect = null;
    }
    
    // Call parent destroy
    super.destroy();
  }

}