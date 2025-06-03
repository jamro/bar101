import * as PIXI from 'pixi.js';

export default class NoiseOverlay extends PIXI.Container {
  constructor() {
    super();

    this._canvas = new PIXI.Graphics()
    this.addChild(this._canvas)
    
    setInterval(() => this.redraw(), 30)

    this._phase = 0
    this._phaseTimer = 0
  }

  redraw() {
    const width = 1020;
    const height = 670
    this._canvas.clear()

    this._phaseTimer--;

    if(this._phaseTimer < 0) {
      this._phase = (this._phase + 1) % 2

      if(this._phase === 0) { // no noise
        this._phaseTimer = 100 + Math.random() * 100
      } else { // noise
        this._phaseTimer = 10 + Math.random() * 50
      }
    }

    if(this._phase === 0) {
      return;
    }


    if(Math.random() < 0.2) { // draw noisy lines
      const lineCount = Math.floor(Math.random() * Math.random() * 30) + 1
      for(let i = 0; i < lineCount; i++) {
        const y = Math.random() * height
        this._canvas.rect(
          -width/2,
          y - height/2,
          width,
          1 + Math.floor(Math.random() * 10)
        ).fill(Math.random() > 0.5 ? 0x000000 : 0x000000)
      }
    }

    if(Math.random() < 0.1) { // draw noisy rectangles
      const rectCount = Math.floor(Math.random() * Math.random() * 3) + 1
      for(let i = 0; i < rectCount; i++) {
        const w = Math.random() * width * 0.2 + width * 0.05
        const h = Math.random() * height * 0.2 + height * 0.05
        const x =  Math.random() * width - width/2
        const y = Math.random() * height - height/2

        this._canvas.rect(x, y, w, h).fill(Math.random() > 0.5 ? 0x000000 : 0x000000)
      }
    }

  }

}