import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';


export default class RecipeSheet extends PIXI.Container {

  constructor(recipe) {
    super();

    this._mode = 'landscape';
    this._recipe = recipe;

    this.offset = 0;
    this.randomShift = Math.floor(Math.random() * 100) - 50;

    this._bg = new PIXI.Sprite(GameAssets.assets['img/paper.png']);
    this._bg.anchor.set(0.5, 0.5);
    this._bg.rotation = Math.floor(Math.random() * 4) * Math.PI / 2;
    this.addChild(this._bg);

    this._titleLabel = new PIXI.Text({
      text: this._recipe.name,
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 70,
        fill: 0x000000,
        align: 'center',
      }
    })
    this.addChild(this._titleLabel);

    this._horizontalLine = new PIXI.Graphics();
    this._horizontalLine.rect(
      -this._bg.width / 2 + 50,
      -4,
      this._bg.width-100,
      8
    ).fill(0x000000);
    this.addChild(this._horizontalLine);

    for (let i = 0; i < this._recipe.ingredients.length; i++) {
      const ingredient = this._recipe.ingredients[i];
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
      ingredientLabel.x = -this._bg.width / 2 + 150;
      ingredientLabel.y = -this._bg.height / 2 + 150 + i * 100;
      this.addChild(ingredientLabel);
    }
    
    const preview = new PIXI.Sprite(GameAssets.assets['img/' + this._recipe.glass + '_drawing.png']);
    preview.anchor.set(1, 1);
    preview.x = this._bg.width / 2 - 50;
    preview.y = this._bg.height / 2 - 50;
    this.addChild(preview);

    this.setLandscapeMode();
  } 

  get size() {
    return Math.max(GameAssets.assets['img/paper.png'].width, GameAssets.assets['img/paper.png'].height);
  }

  get tabHeight() {
    return 120
  }

  setLandscapeMode() {
    this._mode = 'landscape';
    this._titleLabel.anchor.set(0, 0);
    this._titleLabel.y = -this._bg.height / 2 + 20;
    this._titleLabel.x = - this._bg.width / 2 + 50;
    this._titleLabel.rotation = 0;
    this._horizontalLine.rotation = 0;
    this._horizontalLine.x = 0;
    this._horizontalLine.y = -this._bg.height / 2 + this.tabHeight;
  }

  setPortraitMode() {
    this._mode = 'portrait';
    this._titleLabel.anchor.set(1, 0);
    this._titleLabel.y = -this._bg.height / 2 + 50;
    this._titleLabel.x = - this._bg.width / 2 + 20;
    this._titleLabel.rotation = -Math.PI / 2;
    this._horizontalLine.rotation = -Math.PI / 2;
    this._horizontalLine.x = -this._bg.height / 2 + this.tabHeight;
    this._horizontalLine.y = 0;
  }

  update() {
    if (this._mode === 'landscape') {
      this.x += (this.randomShift - this.x) * 0.1;
      this.y += (this.offset - this.y) * 0.1;
      if (Math.abs(this.offset - this.y) < 1) {
        this.y = this.offset;
      }
      if (Math.abs(this.randomShift - this.x) < 1) {
        this.x = this.randomShift;
      }
    } else {
      this.x += (this.offset - this.x) * 0.1;
      this.y += (this.randomShift - this.y) * 0.1;
      if (Math.abs(this.offset - this.x) < 1) {
        this.x = this.offset;
      }
      if (Math.abs(this.randomShift - this.y) < 1) {
        this.y = this.randomShift;
      }
    }
  }

}