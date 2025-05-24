import * as PIXI from 'pixi.js';

export default class TitleBanner extends PIXI.Container {
  constructor() {
    super();
    this._labelBg = new PIXI.Graphics();
    this.addChild(this._labelBg);
    this._labelBg
      .roundRect(0, 0, 900-28, 200-28, 30)
      .fill(0x000000)
      
    this._label = new PIXI.Text({
      text: "",
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 50,
        fill: 0xffffff,
        align: 'center',
      }
    })
    this._label.anchor.set(0.5);
    this._label.x = 436;
    this._label.y = 101;
    this.addChild(this._label);

    this._chapterLabel = new PIXI.Text({
      text: "CHAPTER",
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 30,
        fill: 0xdec583,
        align: 'center',
      }
    })
    this._chapterLabel.anchor.set(0.5);
    this._chapterLabel.x = 0+450-14
    this._chapterLabel.y = 155-100-14
    this.addChild(this._chapterLabel);
  }

  get chapterLabel() {
    return this._chapterLabel.text;
  }
  set chapterLabel(text) {
    this._chapterLabel.text = text;
  }

  get text() {
    return this._label.text;
  }

  set text(text) {
    this._label.text = text;
  }
}