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
    this._drinks = null;
    this._inventory = null;
  }

  init() {
    this._mixingView = new CocktailView(this._drinks, this._inventory);
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

    this._fadeIn();
  }

  _fadeIn() {
    this._fadeoutCover.alpha = 1;
    this.addChild(this._fadeoutCover);
    
    const loop = setInterval(() => {
      this._fadeoutCover.alpha -= 0.03;
      if (this._fadeoutCover.alpha <= 0) {
        clearInterval(loop);
      }
    }, 1000 / 60);
  }

  _fadeOut(drink) {
    this._fadeoutCover.alpha = 0;
    this.addChild(this._fadeoutCover);

    const loop = setInterval(() => {

      this._fadeoutCover.alpha += 0.03;
      if (this._fadeoutCover.alpha >= 1) {
        clearInterval(loop);
        this.cleanUp();
        this.emit('serveDrink', drink);
      }
    }, 1000 / 60);

  }

  cleanUp() {
    console.log("[CocktailMasterContainer] cleanUp");
    if (this._mixingView && this._mixingView.parent) {
      this.removeChild(this._mixingView);
    }
    if (this._recipesView && this._recipesView.parent) {
      this.removeChild(this._recipesView);
    }
    if (this._fadeoutCover && this._fadeoutCover.parent) {
      this.removeChild(this._fadeoutCover);
    }
    if (this._recipesView) {
      this._recipesView.removeAllListeners();
    }
    if (this._mixingView) {
      this._mixingView.removeAllListeners();
      this._mixingView.destroy({ children: true, texture: false, baseTexture: false });
    }
    if (this._recipesView) {
      this._recipesView.destroy({ children: true, texture: false, baseTexture: false });
    }
    this._mixingView = null;
    this._recipesView = null;
    this._fadeoutCover = null;
  }

  restore() {
    this.visible = false;
    this.cleanUp();
    this.init();
  }

  setDrinks(drinks) {
    if (drinks === this._drinks) {
      return;
    }
    if (this._mixingView) {
      console.warn("CocktailMasterContainer: setDrinks called after init");
    }
    if (this._recipesView) {
      console.warn("CocktailMasterContainer: setDrinks called after init");
    }
    this._drinks = drinks;
  }

  setInventory(inventory) {
    if (inventory === this._inventory) {
      return;
    }
    if (this._mixingView) {
      this._mixingView.setInventory(inventory);
    }
    this._inventory = inventory;
  }

  resize(width, height) {
    this.visible = true;
    let viewWidth, viewHeight;
    if(this._mixingView) {
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
    }

    if(this._recipesView) {
      this._recipesView.resize(width, height);
    }

    if(this._fadeoutCover) {
      this._fadeoutCover.clear();
      this._fadeoutCover.rect(0, 0, width, height).fill(0x000000);
    }
  }

}

export default CocktailMasterContainer;