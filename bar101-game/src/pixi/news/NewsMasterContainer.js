import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import GameAssets from "../GameAssets";

const tvOrigSize = { width: 1536, height: 1024 };
const tvScreenSize = { width: 690, height: 460 };

class NewsMasterContainer extends MasterContainer {
  constructor() {
    super();

    this._content = new PIXI.Container();
    this.addChild(this._content);
    this._pipContainer = new PIXI.Container();
    this._content.addChild(this._pipContainer);
    this._pipSprite - null
    this._pipSource = null;
    this._tvOverlay = new PIXI.Sprite(GameAssets.assets['img/tv.png']);
    this._tvOverlay.anchor.set(0.5);
    this.addChild(this._tvOverlay);

    this._officialNews = new PIXI.Sprite(GameAssets.assets['img/news_official.png']);
    this._officialNews.anchor.set(0.5);
    this._content.addChild(this._officialNews);
    this._mode = "official"
    this._officialNews.visible = true;

    this._undergroundNews = new PIXI.Sprite(GameAssets.assets['img/news_underground.png']);
    this._undergroundNews.anchor.set(0.5);
    this._content.addChild(this._undergroundNews);
    this._undergroundNews.visible = false;

    this._headline = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 60,
        fill: 0xdec583,
        align: 'center'
      }
    })
    this._headline.anchor.set(0.5);
    this._headline.y = 420
    this._content.addChild(this._headline);
  }

  setHeadline(text) {
    this._headline.text = text;
  }

  getMode() {
    return this._mode;
  }

  setUndergroundMode() {
    this._mode = "underground";
    this._officialNews.visible = false;
    this._undergroundNews.visible = true;

    this._pipContainer.scale.set(0.75);
    this._pipContainer.x = 1222-768;
    this._pipContainer.y = 267-512;
  }

  setOfficialMode() {
    this._mode = "official";
    this._officialNews.visible = true;
    this._undergroundNews.visible = false;

    this._pipContainer.scale.set(1);
    this._pipContainer.x = 1200-768;
    this._pipContainer.y = 340-512;
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

      if(this._mode === "official") {
        this.setOfficialMode();
      } else {
        this.setUndergroundMode();
      }
    }

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
    this._content.scale.set(tvScale*0.43);
  }


}

export default NewsMasterContainer;