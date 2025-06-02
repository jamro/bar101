import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

export default class WallItems extends PIXI.Container {

  constructor() {
    super();
    this._bg = new PIXI.Sprite(GameAssets.assets['img/recipes.png']);
    this._bg.anchor.set(0.5);
    this.addChild(this._bg);
    this._bg.y = -30;

    this._recipesButton = new PIXI.Graphics();
    this._recipesButton.rect(-380, -250, 250, 330).fill(0x000000);
    this._recipesButton.alpha = 0;
    this._recipesButton.interactive = true;
    this._recipesButton.cursor = 'pointer';
    this._recipesButton.on('pointerdown', () => {
      this.emit('openRecipes');
    });
    this.addChild(this._recipesButton);
  }

}