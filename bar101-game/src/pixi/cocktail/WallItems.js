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

    this._isGlowing = false;
    this._glowingLoop = null;
    this._recipesButtonGlow = new PIXI.Sprite(GameAssets.assets['img/recipes_glow.png']);
    this._recipesButtonGlow.x = -450;
    this._recipesButtonGlow.y = -320;
    this._recipesButtonGlow.alpha = 0;
    this.addChild(this._recipesButtonGlow);

    this.addChild(this._recipesButton);

  }

  set glowing(value) {
    this._isGlowing = value;
    this._recipesButtonGlow.alpha = value ? 1 : 0;
    if(value && !this._glowingLoop) {
      this._glowingLoop = setInterval(() => {
        this._recipesButtonGlow.alpha = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      }, 16);
    } else if(!value && this._glowingLoop) {
      clearInterval(this._glowingLoop);
      this._glowingLoop = null;
    }
  }

  get glowing() {
    return this._isGlowing;
  }

}