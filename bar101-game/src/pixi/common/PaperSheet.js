import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';

const PAPER_ASSET_NAME = 'img/paper.jpg';
const PAGE_MARGIN = 50;

class PaperSheet extends PIXI.Container {

  constructor(title) {
    super();
    this._mode = 'landscape';
    this.offset = 0;
    this.randomShift = Math.floor(Math.random() * 100) - 50;

    this._bg = new PIXI.Sprite(GameAssets.assets[PAPER_ASSET_NAME]);
    this._bg.anchor.set(0.5, 0.5);
    this._bg.rotation = Math.floor(Math.random() * 4) * Math.PI / 2;
    this.addChild(this._bg);

    this._titleLabel = new PIXI.Text({
      text: title,
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 70,
        fill: 0x000000,
        align: 'center',
      }
    })
    this.addChild(this._titleLabel);

    this._horizontalLine = new PIXI.Graphics();
    this._horizontalLine.rect(
      -this._bg.width / 2 + 50,
      -4,
      this._bg.width-100,
      8
    ).fill(0x000000);
    this.addChild(this._horizontalLine);

    this.pageContent = new PIXI.Container();
    this.addChild(this.pageContent);

    this.setLandscapeMode();
  }

  setLandscapeMode() {
    this._mode = 'landscape';
    this._titleLabel.anchor.set(0, 0);
    this._titleLabel.y = -this._bg.height / 2 + 20;
    this._titleLabel.x = - this._bg.width / 2 + 50;
    this._titleLabel.rotation = 0;
    this._horizontalLine.rotation = 0;
    this._horizontalLine.x = 0;
    this._horizontalLine.y = -this._bg.height / 2 + PaperSheet.tabHeight;

    this.pageContent.x = -this._bg.width / 2 + PAGE_MARGIN;
    this.pageContent.y = -this._bg.height / 2 + PAGE_MARGIN + PaperSheet.tabHeight;
  }

  setPortraitMode() {
    this._mode = 'portrait';
    this._titleLabel.anchor.set(1, 0);
    this._titleLabel.y = -this._bg.height / 2 + 50;
    this._titleLabel.x = - this._bg.width / 2 + 20;
    this._titleLabel.rotation = -Math.PI / 2;
    this._horizontalLine.rotation = -Math.PI / 2;
    this._horizontalLine.x = -this._bg.height / 2 + PaperSheet.tabHeight;
    this._horizontalLine.y = 0;

    this.pageContent.y = -this._bg.height / 2 + PAGE_MARGIN;
    this.pageContent.x = -this._bg.width / 2 + PAGE_MARGIN + PaperSheet.tabHeight;
  }
  
  get mode() {
    return this._mode;
  }

  update() {
    if (this._mode === 'landscape') {
      this.x += (this.randomShift - this.x) * 0.1;
      this.y += (this.offset - this.y) * 0.1;
      if (Math.abs(this.offset - this.y) < 1) {
        this.y = this.offset;
      }
      if (Math.abs(this.randomShift - this.x) < 1) {
        this.x = this.randomShift;
      }
    } else {
      this.x += (this.offset - this.x) * 0.1;
      this.y += (this.randomShift - this.y) * 0.1;
      if (Math.abs(this.offset - this.x) < 1) {
        this.x = this.offset;
      }
      if (Math.abs(this.randomShift - this.y) < 1) {
        this.y = this.randomShift;
      }
    }
  }

  get pageWidth() {
    return this._mode === 'landscape' ? PaperSheet.getSize() - 2 * PAGE_MARGIN : PaperSheet.getSize() - 2 * PAGE_MARGIN - PaperSheet.tabHeight;
  }

  get pageHeight() {
    return this._mode === 'landscape' ? PaperSheet.getSize() - 2 * PAGE_MARGIN - PaperSheet.tabHeight : PaperSheet.getSize() - 2 * PAGE_MARGIN;
  }
}

PaperSheet.tabHeight = 120;
PaperSheet.getSize = () => Math.max(GameAssets.assets[PAPER_ASSET_NAME].width, GameAssets.assets[PAPER_ASSET_NAME].height);

export default PaperSheet;