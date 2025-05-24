import * as PIXI from 'pixi.js';

export default class StoryBookButton extends PIXI.Container {
  constructor() {
    super();

    this._buttonBg = new PIXI.Graphics();
    this.addChild(this._buttonBg);
    this._buttonBg.circle(0, 0, 70).fill(0xa83300).stroke({color: 0, width: 14})

    this._backIcon = new PIXI.Graphics();
    this.addChild(this._backIcon);
    this._backIcon.moveTo(-30+30, 0+30)
      .lineTo(-30, 0)
      .lineTo(-30+30, 0-30)
      .moveTo(-30, 0)
      .lineTo(30, 0)
      .stroke({color: 0, width: 14})

    this._backIcon.visible = false;

    this._linesButton = new PIXI.Graphics();
    this.addChild(this._linesButton);
    this._linesButton.moveTo(-30, -20)
      .lineTo(30, -20)
      .moveTo(-30, 0)
      .lineTo(30, 0)
      .moveTo(-30, 20)
      .lineTo(30, 20)
      .stroke({color: 0, width: 10})
    this._linesButton.visible = true;

    this.on('pointerdown', () => {
      this.emit('goBack');
    });

    this.interactive = true;
    this.buttonMode = true;
    this.eventMode = 'static';

  }

  get model() {
    return this._backIcon.visible ? "back" : "lines";
  }

  set model(model) {
    this._backIcon.visible = model === "back";
    this._linesButton.visible = model === "lines";
  }
}