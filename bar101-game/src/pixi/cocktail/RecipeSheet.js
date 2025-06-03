import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import PaperSheet from '../common/PaperSheet';

export default class RecipeSheet extends PaperSheet {

  constructor(recipe) {
    super(recipe.name);

    recipe = recipe;
    this.id = recipe.id;

    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ingredient = recipe.ingredients[i];
      const ingredientLabel = new PIXI.Text({
        text: "- " + ingredient.name + ' ' + ingredient.amount + 'ml',
        style: {
          fontFamily: 'Chelsea Market',
          fontSize: 50,
          fill: 0x000000,
          align: 'left',
        }
      })
      ingredientLabel.anchor.set(0, 0);
      ingredientLabel.x = 0
      ingredientLabel.y =  i * 100;
      this.pageContent.addChild(ingredientLabel);
    }
    
    this._preview = new PIXI.Sprite(GameAssets.assets['img/' + recipe.glass + '_drawing.png']);
    this._preview.anchor.set(1, 1);
    this.pageContent.addChild(this._preview);
    this.setLandscapeMode();
  } 

  setLandscapeMode() {
    super.setLandscapeMode();
    if(this._preview) {
      this._preview.x = this.pageWidth;
      this._preview.y = this.pageHeight;
    }
  }

  setPortraitMode() {
    super.setPortraitMode();
    if(this._preview) {
      this._preview.x = this.pageWidth;
      this._preview.y = this.pageHeight;
    }
  }
  
  
  

}