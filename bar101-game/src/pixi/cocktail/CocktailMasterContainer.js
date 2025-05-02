import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import CocktailView from './CocktailView';
import RecipesView from './RecipesView';

class CocktailMasterContainer extends MasterContainer {
  constructor() {
    super();
    this._mixingView = null;
    this._recipesView = null;
  }

  init() {
    this._mixingView = new CocktailView(this._drinks);
    this._recipesView = new RecipesView(this._drinks);
    this._mixingView.on('serveDrink', (drink) => {
      this.emit('serveDrink', drink);
    });
    this._mixingView.on('openRecipes', () => {
      this._recipesView.visible = true;
    });
    this._recipesView.on('close', () => {
      this._recipesView.visible = false;
    })
    this.addChild(this._mixingView);
    this.addChild(this._recipesView);
  }

  restore() {
    if (this._mixingView) {
      this._mixingView.parent.removeChild(this._mixingView);
    }
    this.init();
  }

  setDrinks(drinks) {
    this._drinks = drinks;
  }

  resize(width, height) {
    let viewWidth, viewHeight;
    if(width > height) {
      this._mixingView.setLandscapeMode();
      viewWidth = this._mixingView.segmentSize * 2;
      viewHeight = this._mixingView.segmentSize;
    } else {
      this._mixingView.setPortraitMode();
      viewWidth = this._mixingView.segmentSize;
      viewHeight = this._mixingView.segmentSize * 2;
    }

    const scaleW = width / viewWidth;
    const scaleH = height / viewHeight;
    const scale = Math.min(scaleW, scaleH);
    this._mixingView.scale.set(scale);
    this._mixingView.x = (width - viewWidth * scale) / 2;
    this._mixingView.y = (height - viewHeight * scale) / 2;

    this._mixingView.sclaleBackground(1/scale);

    this._recipesView.resize(width, height);
  }

}

export default CocktailMasterContainer;