import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';


export default class Table extends PIXI.Container {

  constructor() {
    super();
    this._tableWidth = 1024;
    this.tableWidth = this._tableWidth
  }

  get tableWidth() {
    return this._tableWidth;
  }

  set tableWidth(value) {
    while (this.children.length > 0) {
      this.removeChild(this.children[0]);
    }
    this._tableWidth = 0
    const texture = GameAssets.assets['img/table_texture.png'];
    while (this._tableWidth < value) {
      const tableSprite = new PIXI.Sprite(texture);
      this.addChild(tableSprite);
      tableSprite.x = this._tableWidth;
      this._tableWidth += tableSprite.width;
    }
    this._tableWidth = value;

    const bottomBackground = new PIXI.Graphics();
    this.addChild(bottomBackground);

    bottomBackground.clear();
    bottomBackground
      .rect(0, 0, this._tableWidth, 1024)
      .fill(0)
    bottomBackground.y = texture.height
    this.addChild(bottomBackground);
  }


}