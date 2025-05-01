import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import Drop from './Drop';

export default class Liquid extends PIXI.Container {

  constructor() {
    super();

    this.amount = 0;
    this.source = {x: 800, y: 200};
    this.cutOffY = 900;
    this._drops=[]

    this._particles = new PIXI.ParticleContainer({
      dynamicProperties: {
        position: true,  // Allow dynamic position changes (default)
        scale: false,    // Static scale for extra performance
        rotation: false, // Static rotation
        color: false     // Static color
      }
    });

    this.addChild(this._particles);
  
  }

  update() {
    if (this.amount > 0) {
      const particle = new Drop(this.source.x, this.source.y, this.amount);
      this._particles.addParticle(particle);
      this._drops.push(particle);
    }

    for(let drop of this._drops) {
      drop.update();
      if (drop.y > this.cutOffY) {
        this._particles.removeParticle(drop);
        this._drops.splice(this._drops.indexOf(drop), 1);
      }
    }
  }


}