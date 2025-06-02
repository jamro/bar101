import * as PIXI from 'pixi.js';

const COLOR = 0xdec583

export default class StoryNode extends PIXI.Container {
  constructor(path) {
    super();

    this._path = path;
    this._visited = null;
    this._current = null;
    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);

    this.current = false;
    this.visited = false;

    this.cursor = 'pointer';
  }

  hitTest(x, y) {
    const radius = 30
    const distance = Math.hypot(x - this.x, y - this.y);
    return {
      hit: distance < radius,
      distance: distance
    }
  }

  get path() {
    return this._path;
  }

  get visited() {
    return this._visited;
  }

  set visited(value) {
    if(this._visited === value) {
      return;
    }
    this._visited = value;
    this._bg.clear();
    if(this._visited) {
      this._bg.circle(0, 0, this.path === "x" ? 6 : 5)
        .fill(this.path === "x" ? COLOR : 0x000000)
        .stroke({width: 3, color: COLOR});
    }
  }

  get current() {
    return this._current;
  }

  set current(value) {
    if(this._current === value) { 
      return;
    }
    this._current = value;
    this._bg.clear();
    let fillColor = 0x000000;
    if(this.path === "x") {
      fillColor = COLOR;
    } else if(this._current) {
      fillColor = 0xa83300;
    }
    this._bg.circle(0, 0, this.path === "x" ? 6 : 5)
      .fill(fillColor)
      .stroke({width: 3, color: COLOR});
    
  }
  
}