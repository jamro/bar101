import * as PIXI from 'pixi.js';


export default class TrustMeter extends PIXI.Container {
    constructor() {
        super();
        this._trust = 0;
        this.trustBar = new PIXI.Graphics();
        this.addChild(this.trustBar);

        this._label = new PIXI.Text({
          text: 'TRUST',
          style: {
            fontFamily: 'Chelsea Market',
            fontSize: 50,
            fill: 0xdec583,
            align: 'center'
          }
        })
        this._label.x = 25;
        this._label.y = 25;
        this.addChild(this._label);

        this.trust = this._trust
    }

    set trust(value) {
      value = Math.max(-1, Math.min(1, value));
      this._trust = value;

      const level = Math.round((value + 1) * 0.5 * 4) + 1;

      this.trustBar.clear();
      this.trustBar
        .rect(0, 0, 190, 25)
        .fill(0x000000)

      for (let i = 0; i < level; i++) {
        this.trustBar.rect(5 + i * 38, 5, 25, 15)
          .fill(0xa54200);
      }

    }

}