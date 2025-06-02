import * as PIXI from 'pixi.js';

export default class TimeTravelButton extends PIXI.Container {
  constructor() {
    super();

    this.interactive = true;
    this.cursor = 'pointer';
    this.eventMode = 'static';

    const buttonBg = new PIXI.Graphics();
    this.addChild(buttonBg);
    buttonBg.roundRect(-200, 0, 400, 120, 30)
      .fill(0xa83300)
      .stroke({color: 0, width: 14})

    const buttonLabel = new PIXI.Text({
      text: "Open Chapter >",
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 30,
        fill: 0,
        align: 'center',
      }
    })
    buttonLabel.anchor.set(0.5);
    buttonLabel.x = 0;
    buttonLabel.y = 60;
    this.addChild(buttonLabel);
  }
}