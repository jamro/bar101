import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import GlowEffect from '../common/GlowEffect';

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

    // Create glow effect for recipes button
    const glowTexture = GameAssets.assets['img/recipes_glow.png'];
    this._glowEffect = new GlowEffect(glowTexture, {
      x: -450,
      y: -320,
      anchor: { x: 0, y: 0 }
    });
    this.addChild(this._glowEffect);

    this.addChild(this._recipesButton);
  }

  set glowing(value) {
    if (this._glowEffect) {
      this._glowEffect.glowing = value;
    }
  }

  get glowing() {
    return this._glowEffect ? this._glowEffect.glowing : false;
  }

  destroy() {
    // Clean up glow effect
    if (this._glowEffect) {
      this._glowEffect.destroy();
      this._glowEffect = null;
    }
    
    // Call parent destroy
    super.destroy();
  }

}