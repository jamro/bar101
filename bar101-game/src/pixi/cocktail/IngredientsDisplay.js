import * as PIXI from 'pixi.js';

export default class IngredientsDisplay extends PIXI.Container {
  constructor() {
    super();

    this._rows = []

    for (let i = 0; i < 4; i++) {
      const label = new PIXI.Text({
        text: "",
        style: new PIXI.TextStyle({
          fontFamily: 'Chelsea Market',
          fontSize: 35,
          fill: 0xFFFFFF,
          align: 'right'
        })
      })
      label.alpha = 1 - 0.28 * (i );
      label.anchor.set(1, 1);
      label.x = 0;
      label.y = -i * 45;
      this.addChild(label);
      this._rows.push(label);
    }
  }

  showHint(txt) {
    for (let i = 0; i < this._rows.length; i++) {
      this._rows[i].text = "";
    }
    this._rows[0].text = txt;
  }

  update(ingredientsMap) {
    const ingredients = Object.values(ingredientsMap).sort((a, b) => b.timestamp - a.timestamp);
    for (let i = 0; i < this._rows.length && i < ingredients.length; i++) {
      this._rows[i].text = `${ingredients[i].name}: ${Math.round(ingredients[i].amount)}ml`;
    }

  }

}