import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import CocktailView from './CocktailView';

class CocktailMasterContainer extends MasterContainer {
  constructor() {
    super();
    this._view = null;
  }

  init() {
    this._view = new CocktailView(this._drinks);
    this._view.on('serveDrink', (drink) => {
      this.emit('serveDrink', drink);
    });
    this.addChild(this._view);
  }

  restore() {
    if (this._view) {
      this._view.parent.removeChild(this._view);
    }
    this.init();
  }

  setDrinks(drinks) {
    this._drinks = drinks;
  }

  resize(width, height) {
    let viewWidth, viewHeight;
    if(width > height) {
      this._view.setLandscapeMode();
      viewWidth = this._view.segmentSize * 2;
      viewHeight = this._view.segmentSize;
    } else {
      this._view.setPortraitMode();
      viewWidth = this._view.segmentSize;
      viewHeight = this._view.segmentSize * 2;
    }

    const scaleW = width / viewWidth;
    const scaleH = height / viewHeight;
    const scale = Math.min(scaleW, scaleH);
    this._view.scale.set(scale);
    this._view.x = (width - viewWidth * scale) / 2;
    this._view.y = (height - viewHeight * scale) / 2;

    this._view.sclaleBackground(1/scale);
  }

}

export default CocktailMasterContainer;