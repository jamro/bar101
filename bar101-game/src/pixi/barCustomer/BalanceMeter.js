import * as PIXI from 'pixi.js';

export default class BalanceMeter extends PIXI.Container {
    constructor() {
        super();
        this._cash = 0;
        this._tmpCash = null;

        this._cashLabel = new PIXI.Text({
          text: 'BALANCE',
          style: {
            fontFamily: 'Chelsea Market',
            fontSize: 25,
            fill: 0xa54200,
            align: 'center'
          }
        })
        this._cashLabel.x = 25;
        this._cashLabel.y = -2;
        this.addChild(this._cashLabel);
       
        this._cashLabel = new PIXI.Text({
          text: '$0.00',
          style: {
            fontFamily: 'Chelsea Market',
            fontSize: 50,
            fill: 0xdec583,
            align: 'center'
          }
        })
        this._cashLabel.x = 25;
        this._cashLabel.y = 25;
        this.addChild(this._cashLabel);

        this.cash = this._cash;
    }

    get cash() {
      return this._cash;
    }

    set cash(value) {
      if (this._cash === value) {
        return;
      }
      const diff = value - this._cash;
      this._cash = value;

      const stepAmount = Math.abs(this._tmpCash - this._cash) / 100;

      const animStep = () => {
        if (this._tmpCash < this._cash) {
          this._tmpCash = Math.min(this._tmpCash + stepAmount, this._cash);
          this._cashLabel.text = `$${this._tmpCash.toFixed(2)}`;
          requestAnimationFrame(animStep);
        } else {
          this._tmpCash = this._cash;
        }
      }
      if (this._tmpCash === null) {
        this._tmpCash = this._cash;
        this._cashLabel.text = `$${this._tmpCash.toFixed(2)}`;
      } else if (this._tmpCash !== this._cash) {
        animStep();

        const diffLabel = new PIXI.Text({
          text: `${diff > 0 ? "+" : "-"}$${diff.toFixed(2)}`,
          style: {
            fontFamily: 'Chelsea Market',
            fontSize: 25,
            fill: diff > 0 ? 0xffffff : 0xffffff,
            align: 'center'
          }
        })
        diffLabel.x = 25;
        diffLabel.y = 90;
        this.addChild(diffLabel);
        const fadeOut = () => {
          diffLabel.alpha -= 0.005;
          if (diffLabel.alpha <= 0) {
            this.removeChild(diffLabel);
          } else {
            requestAnimationFrame(fadeOut);
          }
        }
        diffLabel.alpha = 1;
        fadeOut();
      }


      
      

    }

}