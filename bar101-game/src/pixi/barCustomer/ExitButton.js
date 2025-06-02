import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import { Howl } from 'howler';

export default class ExitButton extends PIXI.Container {
  
  constructor() {
    super();

    this._clickSound = new Howl({
      src: ['/audio/click.mp3'],
      loop: false,
      volume: 0.3,
    });

    this._exitButton = new PIXI.Sprite(GameAssets.assets['img/exit_button.png']);
    this._exitButton.interactive = true;
    this._exitButton.cursor = 'pointer';
    this._exitButton.anchor.set(0, 0);
    this._exitButton.on('pointerdown', () => {
      this._clickSound.play();
      let progress = 0
      const loop = setInterval(() => {
        this._exitOkButton.visible = true;
        this._exitCancelButton.visible = true;
        progress += 0.1
        this._exitOkButton.x = 150 * progress
        this._exitCancelButton.alpha = progress
        if(progress > 1) {
          this._exitButton.visible = false;
          clearInterval(loop);
        }
      }, 16);

    });

    this._exitOkButton = new PIXI.Sprite(GameAssets.assets['img/exit_ok_button.png']);
    this._exitOkButton.interactive = true;
    this._exitOkButton.cursor = 'pointer';
    this._exitOkButton.anchor.set(0, 0);
    this._exitOkButton.x = 150
    this._exitOkButton.on('pointerdown', () => {
      this._exitOkButton.visible = false;
      this._exitCancelButton.visible = false;
      this._exitButton.visible = true;
      this._clickSound.play();
      this.emit('exit');
    });


    this._exitCancelButton = new PIXI.Sprite(GameAssets.assets['img/exit_cancel_button.png']);
    this._exitCancelButton.interactive = true;
    this._exitCancelButton.cursor = 'pointer';
    this._exitCancelButton.anchor.set(0, 0);
    this._exitCancelButton.on('pointerdown', () => {
      this._exitOkButton.visible = false;
      this._exitCancelButton.visible = false;
      this._exitButton.visible = true;
      this._clickSound.play();
    });
    this.addChild(this._exitOkButton);
    this.addChild(this._exitButton);
    this.addChild(this._exitCancelButton);

    this._exitOkButton.visible = false;
    this._exitCancelButton.visible = false;
  }
}