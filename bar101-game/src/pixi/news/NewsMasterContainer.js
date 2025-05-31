import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import TvOverlay from './TvOverlay';
import NewsScreen from './NewsScreen';
import { Howl } from 'howler';

const tvScreenSize = { width: 690, height: 460 };

class NewsMasterContainer extends MasterContainer {
  constructor() {
    super();

    this._content = new NewsScreen();
    this.addChild(this._content);
    this._tvOverlay = new TvOverlay();
    this.addChild(this._tvOverlay);

    this._shade = new PIXI.Graphics();
    this.addChild(this._shade);
    this._shade.visible = false;

    this._officialJingle = new Howl({
      src: ['/audio/official_jingle.mp3'],
      volume: 1
    })
    this._undergroundJingle = new Howl({
      src: ['/audio/underground_jingle.mp3'],
      volume: 1
    })

    this._jingleSound = null
  }

  playIntro() {
    this._content.splashVisible = true;
    if(this._jingleSound) {
      this._jingleSound.stop();
    }
    this._jingleSound = this._content.mode === 'official' ? this._officialJingle : this._undergroundJingle
    this._jingleSound.play()
    this.fadeIn()
  }

  hideIntro() {
    this._content.splashVisible = false;
    if(this._jingleSound) {
      this._jingleSound.stop();
      this._jingleSound = null
    }
  }

  setHeadline(text) {
    this._content.headline = text;
  }

  getMode() {
    return this._content.mode;
  }

  setUndergroundMode() {
    this._content.setUndergroundMode();
  }

  setOfficialMode() {
    this._content.setOfficialMode();
  }

  async fadeIn(speed=0.01) {
    this._shade.alpha = 1;
    this._shade.visible = true;

    await new Promise(resolve => {
      const step = () => {
        this._shade.alpha -= speed;
        if(this._shade.alpha <= 0) {
          this._shade.visible = false;
          resolve();
        } else {
          requestAnimationFrame(step);
        }
      }
      step();
    })
  }

  async fadeOut(speed=0.01) {
    this._shade.alpha = 0;
    this._shade.visible = true;

    await new Promise(resolve => {
      const step = () => {
        this._shade.alpha += speed;
        if(this._shade.alpha >= 1) {
          this._shade.visible = false;
          resolve();
        } else {
          requestAnimationFrame(step);
        }
      }
      step();
    })
  }

  async setPip(imgUrl) {
    this._content.setPip(imgUrl);
  }

  resize(width, height) {
    const bottomMargin = 120;
    this._tvOverlay.x = width / 2;
    this._tvOverlay.y = (height) / 2 - bottomMargin/2;

    this._content.x = width / 2;
    this._content.y = (height) / 2 - bottomMargin/2;

    const tvScaleW = width / tvScreenSize.width;
    const tvScaleH = (height-bottomMargin) / tvScreenSize.height;
    const tvScale = Math.min(tvScaleW, tvScaleH)*0.8;
    this._tvOverlay.scale.set(tvScale, tvScale);
    this._content.scale.set(tvScale*0.66);

    this._shade.clear();
    this._shade.rect(0, 0, width, height).fill(0x000000);
  }


}

NewsMasterContainer.instance = null;

NewsMasterContainer.getInstance = () => {
  if(!NewsMasterContainer.instance) {
    NewsMasterContainer.instance = new NewsMasterContainer();
  }
  return NewsMasterContainer.instance;
}

export default NewsMasterContainer;