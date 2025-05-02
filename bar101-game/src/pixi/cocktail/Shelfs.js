import * as PIXI from 'pixi.js';
import Bottle from './Bottle';
import GameAssets from '../GameAssets';

const BOTTLE_ORDER = [
  'lime_juice',
  'simple_syrup',
  'triple_sec',
  'whiskey',
  'gin',
  'vermouth',
  'rum',
  'absinthe'
];

export default class Shelfs extends PIXI.Container {

  constructor(ingredients, inventory) {
    super();
    
    this._ingredients = ingredients;
    this._ingredients.push({
      id: "absinthe",
      name: `Absinthe`,
    })

    this._bottomShelf = new PIXI.Sprite(GameAssets.assets['img/shelf.png']);
    this._bottomShelf.y = 505;
    this._bottomShelf.x = -160;
    this.addChild(this._bottomShelf);

    this._topShelf = new PIXI.Sprite(GameAssets.assets['img/shelf.png']);
    this._topShelf.y = -12;
    this._topShelf.x = -160;
    this.addChild(this._topShelf);

    this._bottles = ingredients
      .sort((a, b) => {
        const aIndex = BOTTLE_ORDER.indexOf(a.id);
        const bIndex = BOTTLE_ORDER.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) {
          return 0;
        } else if (aIndex === -1) {
          return 1;
        } else if (bIndex === -1) {
          return -1;
        }
        return aIndex - bIndex;
      })
      .map((ingredient, index) => {
        const bottle = new Bottle(ingredient.id);
        bottle.x = (index % 4) * 200;
        bottle.y = index < 4 ? 0 : 520;
        bottle.initX = bottle.x;
        bottle.initY = bottle.y;
        this.addChild(bottle);

        const label = new PIXI.Text({
          text: ingredient.name.replace(" ", "\n").replace("_", " "),
          style: new PIXI.TextStyle({
            fontFamily: 'Chelsea Market',
            fontSize: 30,
            fill: 0x000000,
            align: 'center',
          }),
        });
        label.anchor.set(0.5, 0.25);
        label.x = bottle.x;
        label.y = bottle.y + 50;
        
        const labelBg = new PIXI.Graphics();
        const bounds = label.getBounds();
        labelBg.rect(
          bounds.minX-15,
          bounds.minY-4,
          bounds.width+30,
          bounds.height+8
        )
        .fill(0xfff8d3)
        .stroke({
          color: 0x000000,
          width: 4,
        })

        this.addChild(labelBg);
        this.addChild(label);

        bottle.label = label;
        bottle.labelBg = labelBg;

        return bottle;
      })

    this.setInventory(inventory);

  }

  setInventory(inventory) {
    const special = inventory.special || 0;

    const specialBottle = this._bottles.find(bottle => bottle.id === 'absinthe');
    if (special > 0) {
      specialBottle.visible = true;
      specialBottle.label.text = `Absinthe (${special})`;
      specialBottle.label.value = true;
      specialBottle.labelBg.visible = true;


      const bounds = specialBottle.label.getBounds();
      specialBottle.labelBg.clear();
      specialBottle.labelBg.rect(
        bounds.minX-15,
        bounds.minY-4,
        bounds.width+30,
        bounds.height+8
      )
      .fill(0xfff8d3)
      .stroke({
        color: 0x000000,
        width: 4,
      })

    } else {
      specialBottle.visible = false;
      specialBottle.label.visible = false;
      specialBottle.labelBg.visible = false;
    }
  }

  get bottles() {
    return this._bottles;
  }

  get isBottomVisible() {
    return this._bottomShelf.visible;
  }

  set isBottomVisible(value) {
    this._bottomShelf.visible = value;
  }

}