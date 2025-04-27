import * as PIXI from 'pixi.js';

export default class BarTable extends PIXI.Container {

  constructor() {
    super();
    this.load();
  }

  async load() {
    const textureBg = await PIXI.Assets.load('img/bar_bg.png');
    const spriteBg = new PIXI.Sprite(textureBg);
    this.addChild(spriteBg);

    const personTexture = await PIXI.Assets.load('img/rmiskovic.png');
    const personSprite = new PIXI.Sprite(personTexture);
    this.addChild(personSprite);

    const drinkTexture = await PIXI.Assets.load('img/coupe.png');
    const drinkSprite = new PIXI.Sprite(drinkTexture);
    this.addChild(drinkSprite);
  }

  get initWidth() {
    return 1024;
  }

  get initHeight() {
    return 683;
  }


}