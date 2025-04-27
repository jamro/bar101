import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

export default class BarTable extends PIXI.Container {

  constructor() {
    super();
    this._bgSprite = new PIXI.Sprite(GameAssets.assets['img/bar_bg.png']);
    this.addChild(this._bgSprite);
    this._customerSprite = null
    this._drinkSprite = null;
  }

  setCustomer(customer) {
    if (this._customerSprite) {
      this.removeChild(this._customerSprite);
    }
    if(customer) {
      this._customerSprite = new PIXI.Sprite(GameAssets.assets[`img/${customer.id}.png`]);
      this.addChild(this._customerSprite);
    }
  }

  setDrink(drink) {
    if (this._drinkSprite) {
      this.removeChild(this._drinkSprite);
    }
    if(drink) {
      this._drinkSprite = new PIXI.Sprite(GameAssets.assets[`img/${drink.glass}.png`]);
      this.addChild(this._drinkSprite);
    }
  }

  get initWidth() {
    return 1024;
  }

  get initHeight() {
    return 683;
  }


}