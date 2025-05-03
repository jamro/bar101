import * as PIXI from 'pixi.js';
import RecipeSheet from './RecipeSheet';
import SheetGroup from '../common/SheetGroup';

export default class RecipesView extends SheetGroup {
  constructor(drinks) {
    super();
    
    const allDrinks = Object.values(drinks);
    for (let i = 0; i < allDrinks.length; i++) {
      const recipe = allDrinks[i];
      const sheet = new RecipeSheet(recipe);
      this.addSheet(sheet);
    }

  }

}