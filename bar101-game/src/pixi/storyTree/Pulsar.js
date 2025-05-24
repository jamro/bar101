import * as PIXI from 'pixi.js';

export default class Pulsar extends PIXI.Container {
  constructor() {
    super();

    this._t = 0

    this._canvas = new PIXI.Graphics();
    this.addChild(this._canvas);
  }

  update() {
    const tMax = 100
    this._canvas.clear();

    const circleCount = 2
    for(let i=0; i<circleCount; i++) {
      const step = Math.round(tMax/circleCount)
      this._canvas.circle(0, 0, 10+((this._t + i*step) % tMax))
        .stroke({
          width: 3, 
          color: 0xa83300,
          alpha: 1-(this._t + i*step) % tMax / tMax
        });
    }

    this._t += 1
    if(this._t > 2*tMax) {
      this._t = 0
    }
  }
}