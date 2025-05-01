import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

export default class Drop extends PIXI.Particle {
  
  constructor(x, y, size=1) {
    const texture = GameAssets.assets['img/drop.png']
    const scale = Math.random() * 0.5 + 0.5*size
    super({
      texture,
      x: x - texture.width * 0.5 * scale,
      y: y - texture.height * 0.5 * scale,
    })

    this._vx = Math.random() * 2
    this._vy = 7

    this.scaleX = scale
    this.scaleY = scale
  }

  update() {
    this.x += this._vx
    this.y += this._vy
    this._vy += 0.2
    this._vx *= 0.85
  }
}