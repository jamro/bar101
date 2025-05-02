import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import CocktailView from './CocktailView';
import RecipesView from './RecipesView';

class CocktailMasterContainer extends MasterContainer {
  constructor() {
    super();
    this._mixingView = null;
    this._recipesView = null;
    this._fadeoutCover = null;
  }

  init() {
    this._mixingView = new CocktailView(this._drinks);
    this._recipesView = new RecipesView(this._drinks);
    this._fadeoutCover = new PIXI.Graphics();
    this._mixingView.on('serveDrink', (drink) => {
      this._fadeOut(drink);
    });
    this._mixingView.on('openRecipes', () => {
      this._recipesView.visible = true;
    });
    this._recipesView.on('close', () => {
      this._recipesView.visible = false;
    })
    this.addChild(this._mixingView);
    this.addChild(this._recipesView);
    this._recipesView.visible = false;
  }

  _fadeOut(drink) {

    this._fadeoutCover.alpha = 0;
    this.addChild(this._fadeoutCover);

    const loop = setInterval(() => {

      this._fadeoutCover.alpha += 0.02;
      if (this._fadeoutCover.alpha >= 1) {
        clearInterval(loop);
        this.cleanUp();
        this.emit('serveDrink', drink);
      }
    }, 1000 / 60);

  }

  cleanUp() {
    this.removeChild(this._mixingView);
    this.removeChild(this._recipesView);
    this.removeChild(this._fadeoutCover);
    this._recipesView.removeAllListeners();
    this._mixingView.removeAllListeners();
    this._mixingView.destroy({ children: true, texture: false, baseTexture: false });
    this._recipesView.destroy({ children: true, texture: false, baseTexture: false });
    this._mixingView = null;
    this._recipesView = null;
    this._fadeoutCover = null;
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

    this._fadeoutCover.clear();
    this._fadeoutCover.rect(0, 0, width, height).fill(0x000000);
  }

}

export default CocktailMasterContainer;