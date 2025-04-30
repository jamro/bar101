import * as PIXI from 'pixi.js';
import Bottle from './Bottle';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';

export default class CocktailView extends PIXI.Container {

  constructor(drinks) {
    super()
    if (drinks.length === 0) {
      console.warn("[CocktailMasterContainer] No drinks to display");
      return;
    }

    this._drinks = drinks;
    this._mode = LANDSCAPE;

    this._background = new PIXI.Graphics();
    this.addChild(this._background);

    this._bottleContainer = new PIXI.Container();
    this.addChild(this._bottleContainer);

    this._bottles = Object.values(this._drinks).map((drink, index) => {
      const bottle = new Bottle(drink.id);
      bottle.x = index * 120;
      bottle.y = 0;
      this._bottleContainer.addChild(bottle);

      bottle.on('pointertap', () => {
        this.emit('serveDrink', {
          ...drink,
          quality: 0.5,
          special: false,
          glass: "rocks",
        });
      });
      return bottle;
    })

    this.setLandscapeMode()
  }
  
  setLandscapeMode() {
    this._mode = LANDSCAPE;
    this._background.clear();
    this._background
      .rect(0, 0, 2*this.segmentSize, this.segmentSize)
      .fill(0x0000ff)

    this._bottleContainer.x = 100;
    this._bottleContainer.y = 400;

  }
  setPortraitMode() {
    this._mode = PORTRAIT;
    this._background.clear();
    this._background
      .rect(0, 0, this.segmentSize, 2*this.segmentSize)
      .fill(0x00ff00)

    this._bottleContainer.x = 150;
    this._bottleContainer.y = 100;
  }

  get segmentSize() {
    return 1024;
  }



}

