import * as PIXI from 'pixi.js';


export default class TrustMeter extends PIXI.Container {
    constructor() {
        super();
        this._trust = 0;
        this._tmpTrust = null;
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
      console.log(`trust update: ${value}`, this._tmpTrust);
      if (this._trust === value) {
        return;
      }
      const diff = value - this._trust;
      this._trust = value;

      const level = ((value + 1) * 0.5 * 4) + 1;
      const levelRounded = Math.floor(level);
      const levelLeftOver = level - levelRounded; 

      this.trustBar.clear();
      this.trustBar
        .rect(0, 0, 190, 25)
        .fill(0x000000)

      for (let i = 0; i < 5; i++) {
        this.trustBar.rect(5 + i * 38, 5, 25, 15)
          .fill((i < levelRounded) ? 0xa54200 : 0x222222);
      }
      if (levelLeftOver > 0) {
        this.trustBar.rect(5 + levelRounded * 38, 5, 25 * levelLeftOver, 15)
          .fill(0xa54200);
      }
      
      if (this._tmpTrust !== null) {
        const diffLabel = new PIXI.Text({
          text: `${diff > 0 ? "+" : "-"}${Math.round((Math.abs(diff*100*0.5)))}%`,
          style: {
            fontFamily: 'Chelsea Market',
            fontSize: 25,
            fill: diff > 0 ? 0xffffff : 0xa54200,
            align: 'center'
          }
        })
        diffLabel.x = 60;
        diffLabel.y = 90;
        this.addChild(diffLabel);
        const fadeOut = () => {
          diffLabel.alpha -= 0.002;
          if (diffLabel.alpha <= 0) {
            this.removeChild(diffLabel);
          } else {
            requestAnimationFrame(fadeOut);
          }
        }
        diffLabel.alpha = 1;
        fadeOut();
      }
      this._tmpTrust = this._trust;

    }

}