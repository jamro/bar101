import * as PIXI from 'pixi.js';
import StoryBookButton from './StoryBookButton';
import Slider from './Slider';

export default class BookContent extends PIXI.Container {
  constructor() {
    super();
    this.interactive = true;
    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);
    this._bg
      .circle(310, -310, 90)
      .fill(0xdec583)
      .roundRect(-400, -370, 710, 750, 30)
      .fill(0x000000)
      .stroke({color: 0xdec583, width: 14})

    this._bodyText = new PIXI.Text({
      text: "",
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 32,
        fill: 0xdec583,
        align: 'justify',
        wordWrap: true,
        wordWrapWidth: 600
      }
    })
    this.addChild(this._bodyText)

    this._slider = new Slider()
    this.addChild(this._slider)

    this._backButton = new StoryBookButton()
    this.addChild(this._backButton)
    this._backButton.x = 310
    this._backButton.y = -310
    this._backButton.model = "back"
    this._backButton.on('pointerdown', () => {
      this.emit('goBack')
    })

    this._bodyText.x = -370
    this._bodyText.y = -340

    this._textMask = new PIXI.Graphics();
    this.addChild(this._textMask);
    this._textMask.roundRect(-400, -350, 710, 710, 30)
      .fill(0x0000ff)
    this._bodyText.mask = this._textMask;


    this._slider.x = 310
    this._slider.y = -210+90
    this._slider.on('sliderMove', (percent) => {
      const heightDiff = Math.max(0, this._bodyText.height - 690);
      this._bodyText.y = -340 - heightDiff * percent;
    })
    
  }

  updateData(data) {
    this._bodyText.text = data.story_summary
    const heightDiff = Math.max(0, this._bodyText.height - 690);
    this._slider.visible = heightDiff > 0;
  }
}