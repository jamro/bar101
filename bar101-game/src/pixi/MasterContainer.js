import * as PIXI from 'pixi.js';

export default class MasterContainer extends PIXI.Container {

  constructor() {
    super();
    this._initialized = false;

  }

  restore() {

  }

  doInit() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this.init();
  }

  init() {

  }

  get initialized() {
    return this._initialized;
  }


  resize(width, height) {

  }

}