import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import BciScorePage from './BciScorePage';
import BciProfilePage from './BciProfilePage';
import BciHistoryPage from './BciHistoryPage';

export default class BciScanner extends PIXI.Container {
  constructor() {
    super();

    this._customer = null;

    this._bg  = PIXI.Sprite.from(GameAssets.assets['img/bci_scanner.png']);
    this.addChild(this._bg);

    this._titleLabel = new PIXI.Text({
      text: 'BCI SCAN',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 25,
        fill: 0xdec583,
        align: 'left'
      }
    })
    this._titleLabel.anchor.set(0, 0);
    this._titleLabel.x = 205;
    this._titleLabel.y = 175;
    this.addChild(this._titleLabel);

    this._userIdLabel = new PIXI.Text({
      text: 'UID:',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 25,
        fill: 0xdec583,
        align: 'right'
      }
    })
    this._userIdLabel.anchor.set(1, 0);
    this._userIdLabel.x = 565;
    this._userIdLabel.y = 175;
    this.addChild(this._userIdLabel);

    this._pagesLabel = new PIXI.Text({
      text: 'PAGE 1/1',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 25,
        fill: 0xdec583,
        align: 'center'
      }
    })
    this._pagesLabel.anchor.set(0.5, 1);
    this._pagesLabel.x = 385;
    this._pagesLabel.y = 595;
    this.addChild(this._pagesLabel);

    let horizontalLine = new PIXI.Graphics();
    horizontalLine.rect(0, 0, 370, 3)
      .fill(0xdec583);
    this.addChild(horizontalLine);
    horizontalLine.x = 200;
    horizontalLine.y = 210;

    horizontalLine = new PIXI.Graphics();
    horizontalLine.rect(0, 0, 370, 3)
      .fill(0xdec583);
    this.addChild(horizontalLine);
    horizontalLine.x = 200;
    horizontalLine.y = 550;

    this._upButton = new PIXI.Sprite(GameAssets.assets['img/bci_up.png']);
    this.addChild(this._upButton);
    this._upButton.x = 609;
    this._upButton.y = 210;
    this._upButton.interactive = true;
    this._upButton.buttonMode = true;
    this._upButton.alpha = 0;
    this._upButton.on('pointerdown', () => {
      this._upButton.alpha = 1;
      this.setPageIndex((this._currentPageIndex + 1) % this._pages.length);
    });
    this._upButton.on('pointerup', () => {
      this._upButton.alpha = 0;
    });

    this._downButton = new PIXI.Sprite(GameAssets.assets['img/bci_down.png']);
    this.addChild(this._downButton);
    this._downButton.x = 607;
    this._downButton.y = 458;
    this._downButton.interactive = true;
    this._downButton.buttonMode = true;
    this._downButton.alpha = 0;
    this._downButton.on('pointerdown', () => {
      this._downButton.alpha = 1;
      this.setPageIndex((this._currentPageIndex - 1 + this._pages.length) % this._pages.length);
    });
    this._downButton.on('pointerup', () => {
      this._downButton.alpha = 0;
    });

    this._offButton = new PIXI.Sprite(GameAssets.assets['img/bci_off.png']);
    this.addChild(this._offButton);
    this._offButton.x = 608;
    this._offButton.y = 325;
    this._offButton.interactive = true;
    this._offButton.buttonMode = true;
    this._offButton.alpha = 0;
    this._offButton.on('pointerdown', () => {
      this._offButton.alpha = 1;
    });
    this._offButton.on('pointerup', () => {
      this._offButton.alpha = 0;
      this.emit('close');
    });
    
    this._currentPageIndex = 0;
    this._pages = [
      new BciScorePage(),
      new BciHistoryPage(),
      new BciProfilePage(),
    ]
    this._currentPage = 0;
    this._pagesContainer = new PIXI.Container();
    this.addChild(this._pagesContainer);
    this._pagesContainer.x = 400 - 200
    this._pagesContainer.y = 400 - 180
    
    this.setPageIndex(0);
  }

  setPageIndex(index) {
    this._currentPageIndex = index;
    while(this._pagesContainer.children.length > 0) {
      this._pagesContainer.removeChild(this._pagesContainer.children[0]);
    }
    this._pagesContainer.addChild(this._pages[index]);
    this._pagesLabel.text = `PAGE ${index + 1}/${this._pages.length}`;
  }

  setData(data) {
    this._customer = data.customer;
    this._userIdLabel.text = `UID: ${this._customer.id}`;
    for (let i = 0; i < this._pages.length; i++) {
      this._pages[i].setData(data);
    }
  }

  get deviceWidth() {
    return this._bg.width;
  }

  get deviceHeight() {
    return this._bg.height;
  }
  
  
}