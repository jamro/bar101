import * as PIXI from 'pixi.js';
import GameAssets from "../GameAssets";
import NoiseOverlay from './NoiseOverlay';

export default class NewsScreen extends PIXI.Container {
  constructor() {
    super();

    this._content = new PIXI.Container();
    this.addChild(this._content);
    this._pipContainer = new PIXI.Container();
    this._pipSprite - null
    this._pipSource = null;

    this._officialNews = new PIXI.Sprite(GameAssets.assets['img/news_official.jpg']);
    this._officialNews.anchor.set(0.5);
    this._content.addChild(this._officialNews);
    this._mode = "official"
    this._officialNews.visible = true;

    this._undergroundNews = new PIXI.Sprite(GameAssets.assets['img/news_underground.jpg']);
    this._undergroundNews.anchor.set(0.5);
    this._content.addChild(this._undergroundNews);
    this._undergroundNews.visible = false;

    this._content.addChild(this._pipContainer);

    this._headline = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 40,
        fill: 0xdec583,
        align: 'center'
      }
    })
    this._headline.anchor.set(0.5);
    this._headline.y = 280
    this._content.addChild(this._headline);

    this._noise = new NoiseOverlay()
    this._content.addChild(this._noise)
  }

  set headline(text) {
    this._headline.text = text;
  }

  get headline() {
    return this._headline.text;
  }

  get mode() {
    return this._mode;
  }

  setUndergroundMode() {
    this._mode = "underground";
    this._officialNews.visible = false;
    this._undergroundNews.visible = true;

    this._pipContainer.scale.set(0.48);
    this._pipContainer.x = 300;
    this._pipContainer.y = -160;
  }

  setOfficialMode() {
    this._mode = "official";
    this._officialNews.visible = true;
    this._undergroundNews.visible = false;

    this._pipContainer.scale.set(0.61);
    this._pipContainer.x = 283;
    this._pipContainer.y = -115;
  }
  

  async setPip(imgUrl) {
    if (this._pipSource === imgUrl) {
      return;
    }
    let texture = null;
    if (imgUrl) {
      console.log("Loading pip image: ", imgUrl);
      texture = await PIXI.Assets.load(imgUrl);
    }
    if (this._pipSprite) {
      this._pipContainer.removeChild(this._pipSprite);
      this._pipSprite.destroy();
      this._pipSprite = null;
      this._pipSource = null;
    }
    if (imgUrl) {
      this._pipSprite = new PIXI.Sprite(texture);
      this._pipSprite.anchor.set(0.5);
      this._pipContainer.addChild(this._pipSprite);
      this._pipSource = imgUrl;

      if(this._mode === "official") { // reposition pip
        this.setOfficialMode();
      } else {
        this.setUndergroundMode();
      }
    }

  }

  
}