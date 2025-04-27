import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

const assetsPosition = {
  'img/rocks.png': { x: 417, y: 492 },
  'img/coupe.png': { x: 409, y: 444 },
  'img/dtomenko.png': { x: 301, y: 94 },
  'img/olintz.png': { x: 262, y: 82 },
  'img/lkova.png': { x: 228, y: 57 },
  'img/npetrak.png': { x: 222, y: 82 },
  'img/rmiskovic.png': { x: 273, y: 92 },
  'img/shalek.png': { x: 261, y: 83 },
};

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
      this._customerSprite.x = assetsPosition[`img/${customer.id}.png`].x;
      this._customerSprite.y = assetsPosition[`img/${customer.id}.png`].y;
      this.addChild(this._customerSprite);
    }
  }

  setDrink(drink) {
    if (this._drinkSprite) {
      this.removeChild(this._drinkSprite);
    }
    if(drink) {
      this._drinkSprite = new PIXI.Sprite(GameAssets.assets[`img/${drink.glass}.png`]);
      this._drinkSprite.x = assetsPosition[`img/${drink.glass}.png`].x;
      this._drinkSprite.y = assetsPosition[`img/${drink.glass}.png`].y;
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