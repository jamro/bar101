import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

export default class ExitButton extends PIXI.Container {
  
  constructor() {
    super();

    this._exitButton = new PIXI.Sprite(GameAssets.assets['img/exit_button.png']);
    this._exitButton.interactive = true;
    this._exitButton.buttonMode = true;
    this._exitButton.anchor.set(0, 0);
    this._exitButton.on('pointerdown', () => {
      let progress = 0
      const loop = setInterval(() => {
        this._exitOkButton.visible = true;
        this._exitCancelButton.visible = true;
        progress += 0.1
        this._exitOkButton.x = -150 * progress
        this._exitCancelButton.alpha = progress
        if(progress > 1) {
          this._exitButton.visible = false;
          clearInterval(loop);
        }
      }, 16);

    });

    this._exitOkButton = new PIXI.Sprite(GameAssets.assets['img/exit_ok_button.png']);
    this._exitOkButton.interactive = true;
    this._exitOkButton.buttonMode = true;
    this._exitOkButton.anchor.set(0, 0);
    this._exitOkButton.x = -150
    this._exitOkButton.on('pointerdown', () => {
      this._exitOkButton.visible = false;
      this._exitCancelButton.visible = false;
      this._exitButton.visible = true;
      this.emit('exit');
    });


    this._exitCancelButton = new PIXI.Sprite(GameAssets.assets['img/exit_cancel_button.png']);
    this._exitCancelButton.interactive = true;
    this._exitCancelButton.buttonMode = true;
    this._exitCancelButton.anchor.set(0, 0);
    this._exitCancelButton.on('pointerdown', () => {
      this._exitOkButton.visible = false;
      this._exitCancelButton.visible = false;
      this._exitButton.visible = true;
    });
    this.addChild(this._exitOkButton);
    this.addChild(this._exitButton);
    this.addChild(this._exitCancelButton);

    this._exitOkButton.visible = false;
    this._exitCancelButton.visible = false;
  }
}