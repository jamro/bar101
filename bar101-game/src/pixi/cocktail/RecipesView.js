import * as PIXI from 'pixi.js';
import RecipeSheet from './RecipeSheet';

export default class RecipesView extends PIXI.Container {
  constructor(drinks) {
    super();

    this._overlay = new PIXI.Graphics();
    this._overlay.alpha = 0.65;
    this._overlay.interactive = true;
    this.addChild(this._overlay);

    this._closeLabel = new PIXI.Text({
      text: 'Close X',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 50,
        fill: 0xffffff,
        align: 'center',
        stroke: 0x000000,
        strokeThickness: 4,
      }
    })
    this._closeLabel.anchor.set(1, 0);
    this._paperContainer = new PIXI.Container();
    
    this.addChild(this._paperContainer);

    // add recipes
    this._sheets = []
    
    const allDrinks = Object.values(drinks);
    for (let i = 0; i < allDrinks.length; i++) {
      const recipe = allDrinks[i];
      const sheet = new RecipeSheet(recipe);
      sheet.rotation = Math.random() * 0.08 - 0.04
      this._sheetTabHeight = this._sheetTabHeight || sheet.tabHeight;
      this._sheetSize = this._sheetSize || sheet.size;
      this._paperContainer.addChild(sheet);
      this._sheets.push(sheet);
      sheet.interactive = true;
      sheet.buttonMode = true;
      sheet.on('pointerdown', () => {
        this.movePageToTop(sheet);
      });
    } 
    this._paperSlots = []
    for (let i = 0; i < this._sheets.length; i++) {
      // set offset
      const allTabsWidth = this._sheetTabHeight * (allDrinks.length-1);
      this._paperSlots.push(-this._sheetTabHeight * (this._sheets.length-1-i) + allTabsWidth / 2);
    }
    this.movePageToTop(this._sheets[this._sheets.length-1]);

    this._closeButton = new PIXI.Graphics();
    this._closeButton.interactive = true;
    this._closeButton.buttonMode = true;
    this._closeButton.on('pointerdown', () => {
      this.emit('close');
    });
    this._closeButton.rect(-300, 0, 300, 140).fill(0x000000);
    this._closeButton.alpha = 0;
    this.addChild(this._closeLabel);
    this.addChild(this._closeButton);
    
    // rendering / update
    let loop
    this.on('added', () => {
      loop = setInterval(() => this._update(), 1000/60);
    })
    this.on('removed', () => {
      clearInterval(loop)
    })
    
  }

  movePageToTop(page) {
    page.parent.setChildIndex(page, page.parent.children.length-1);
    const index = this._sheets.indexOf(page);

    // move page to the the end of the array
    this._sheets.splice(index, 1);
    this._sheets.push(page);

    for (let i = 0; i < this._sheets.length; i++) {
      const sheet = this._sheets[i];
      sheet.offset = this._paperSlots[i];
    }
  }

  _update() {
    for (let sheet of this._sheets) {
      sheet.update();
    }
  }

  resize(width, height) {
    this._overlay.clear();
    this._overlay.rect(0, 0, width, height).fill(0x000000);

    this._closeLabel.x = width-20
    this._closeLabel.y = 20;
    this._closeButton.x = width;
    this._closeButton.y = 0;

    let newMode = 'portrait';
    if(width > height) {
      newMode = 'landscape';
    }
    if (this._mode !== newMode) {
      this._mode = newMode;
      for (let sheet of this._sheets) {
        if (this._mode === 'landscape') {
          sheet.setPortraitMode();
        } else {
          sheet.setLandscapeMode();
        }
      }
    }
    let sheetsWidth, sheetsHeight;
    if(this._mode === 'landscape') {
      sheetsWidth = this._sheetTabHeight * (this._sheets.length-1) + this._sheetSize;
      sheetsHeight = this._sheetSize;
    } else {
      sheetsWidth = this._sheetSize;
      sheetsHeight = this._sheetTabHeight * (this._sheets.length-1) + this._sheetSize;
    }
    const scaleWidth = width / (1.3*sheetsWidth)
    const scaleHeight = height / (1.3*sheetsHeight)
    const scale = Math.min(scaleWidth, scaleHeight);
    this._closeButton.scale.set(scale);
    this._closeLabel.scale.set(scale);
    this._paperContainer.scale.set(scale);
    if(this._mode === 'landscape') {
      this._paperContainer.x = width/2
      this._paperContainer.y = height/2
    } else {
      this._paperContainer.x = width/2;
      this._paperContainer.y = height/2
    }

  }

}