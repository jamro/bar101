import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import GameAssets from '../GameAssets';

class HomeMasterContainer extends MasterContainer {
  constructor() {
    super();

    this._container = new PIXI.Container();
    this.addChild(this._container);

    this._bg = new PIXI.Sprite(GameAssets.assets['img/bar101_entrence.jpg']);
    this._container.addChild(this._bg);

    this._neonOff = new PIXI.Sprite(GameAssets.assets['img/bar101_entrence_off.png']);
    this._neonOff.x = 172;
    this._neonCooldown = 0;
    this._neonMode = 'on';
    this._neonOff.y = 126
    this._container.addChild(this._neonOff);

    this._cameraLed = new PIXI.Sprite(GameAssets.assets['img/bar101_entrence_led.png']);
    this._cameraLed.x = 116;
    this._cameraLed.y = 78;
    this._container.addChild(this._cameraLed);
    this._ledTimer = 0;

    this._loop = setInterval(() => this.update(), 16);

    this._cover = new PIXI.Graphics();
    this.addChild(this._cover);
  }

  update() {
    this._neonCooldown--;
    if (this._neonCooldown <= 0) {
      if (this._neonMode === 'on') {
        this._neonMode = 'off';
        this._neonCooldown = Math.floor(Math.random() * Math.random() * 100);
      } else {
        this._neonMode = 'on';
        this._neonCooldown = Math.floor(Math.random() * 100) + 100;
      }
    }
    if (this._neonMode === 'on') {
      this._neonOff.alpha = 0
    } else {
      this._neonOff.alpha = Math.random();
    }

    this._ledTimer+=2;
    this._ledTimer %= 360;
    this._cameraLed.alpha = Math.sin(this._ledTimer * Math.PI / 180) * 0.5 + 0.5;

  }

  resize(width, height) {
    const scaleW = width / this._bg.width;
    const scaleH = height / this._bg.height;
    const scale = Math.min(scaleW, scaleH);
    this._container.scale.set(scale, scale);
    this._container.x = (width - this._bg.width * scale) / 2;
    this._container.y = (height - this._bg.height * scale) / 2;

    this._cover.clear();
    this._cover.rect(0, 0, width, height).fill(0x000000);
  }

  fadeIn() {
    this._cover.alpha = 1;
    this._cover.blendMode = 'overlay';
    this._loop = setInterval(() => {
      this._cover.alpha -= 0.015;
      if(this._cover.alpha <= 0) {
        clearInterval(this._loop);
      }
    }, 16)
  }
  
  restore() {
    this.fadeIn();
  }

  init() {
    this.fadeIn();
  }
}

HomeMasterContainer.instance = null;

HomeMasterContainer.getInstance = () => {
  if(!HomeMasterContainer.instance) {
    HomeMasterContainer.instance = new HomeMasterContainer();
  }
  return HomeMasterContainer.instance;
}

export default HomeMasterContainer;