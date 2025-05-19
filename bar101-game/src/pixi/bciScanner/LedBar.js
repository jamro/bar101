import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

export default class LedBar extends PIXI.Container {
  constructor() {
    super();

    this._ledValues = [0, 0, 0, 0];
    this._masterValue = 0;
    this._masterValueTarget = 0;

    this._leds = [];
    for(let i = 0; i < 4; i++) {
      const led = new PIXI.Sprite(GameAssets.assets['img/led.png']);
      led.anchor.set(0.5, 0);
      led.x = 385 + i * 57;
      led.y = 625;
      led.alpha = 0;
      this.addChild(led);
      this._leds.push(led);
    }

    this._masterLed = new PIXI.Sprite(GameAssets.assets['img/led.png']);
    this._masterLed.anchor.set(0.5, 0.5);
    this._masterLed.x = 228
    this._masterLed.y = 122;
    this._masterLed.scale.set(1.4);
    this.addChild(this._masterLed);

    setInterval(() => this._update(), 30);
  }

  _update() {
    this._ledValues.forEach((value, index) => {
      this._leds[index].alpha += (value - this._leds[index].alpha) * 0.2;
    });
    this._masterValue += (this._masterValueTarget - this._masterValue) * 0.05;
    this._masterLed.alpha = this._masterValue;
  }

  setPower(value) {
    this._masterValueTarget = value ? 1 : 0;
  }

  setLed(index, value) {
    this._ledValues[index] = value;
  }


}