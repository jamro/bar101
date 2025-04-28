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

    this._customerContainer = new PIXI.Container();
    this._drinkContainer = new PIXI.Container();
    this.addChild(this._customerContainer);
    this.addChild(this._drinkContainer);
  }

  setCustomer(customer, anim=false) {
    if (this._customerSprite && this._customerSprite.parent) {
      this._customerSprite.parent.removeChild(this._customerSprite);
    }
    if(customer) {
      this._customerSprite = new PIXI.Sprite(GameAssets.assets[`img/${customer.id}.png`]);
      const targetX = assetsPosition[`img/${customer.id}.png`].x;
      const targetY = assetsPosition[`img/${customer.id}.png`].y;
      this._customerContainer.addChild(this._customerSprite);
      if(!anim) {
        this._customerSprite.x = targetX;
        this._customerSprite.y = targetY;
        this._alpha = 1;
      } else {
        this._customerSprite.x = targetX + 150;
        this._customerSprite.y = targetY + 20;
        this._customerSprite.alpha = 0;

        const s = this._customerSprite
        const animStep = () => {
          s.x += (targetX - s.x) / 30;
          s.y += (targetY - s.y) / 30;
          
          const distance = Math.sqrt(
            Math.pow(s.x - targetX, 2) +
            Math.pow(s.y - targetY, 2)
          );
          s.alpha = Math.max(0, 1 - distance / 100);
          if (distance > 1) {
            requestAnimationFrame(animStep);
          } else {
            s.x = targetX;
            s.y = targetY;
          }
        }
        animStep();
      }
    }
  }

  setDrink(drink, anim=false) {
    if (this._drinkSprite && this._drinkSprite.parent) {
      this._drinkSprite.parent.removeChild(this._drinkSprite);
    }
    if(drink) {
      this._drinkSprite = new PIXI.Sprite(GameAssets.assets[`img/${drink.glass}.png`]);
      const targetX = assetsPosition[`img/${drink.glass}.png`].x;
      const targetY = assetsPosition[`img/${drink.glass}.png`].y;
      this._drinkContainer.addChild(this._drinkSprite);

      if(!anim) {
        this._drinkSprite.x = targetX;
        this._drinkSprite.y = targetY;
        this._alpha = 1;
      } else {
        this._drinkSprite.x = targetX - 150;
        this._drinkSprite.y = targetY + 20;
        this._drinkSprite.alpha = 0;

        const s = this._drinkSprite
        const animStep = () => {
          s.x += (targetX - s.x) / 20;
          s.y += (targetY - s.y) / 20;
          
          const distance = Math.sqrt(
            Math.pow(s.x - targetX, 2) +
            Math.pow(s.y - targetY, 2)
          );
          s.alpha = Math.max(0, 1 - distance / 100);
          if (distance > 1) {
            requestAnimationFrame(animStep);
          } else {
            s.x = targetX;
            s.y = targetY;
          }
        }
        animStep();
      }
    }
  }

  get initWidth() {
    return 1024;
  }

  get initHeight() {
    return 683;
  }

}