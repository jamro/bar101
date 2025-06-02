import * as PIXI from 'pixi.js';
import GameAssets from '../GameAssets';
import BciScorePage from './BciScorePage';
import BciProfilePage from './BciProfilePage';
import BciHistoryPage from './BciHistoryPage';
import { Howl } from 'howler';
import LedBar from './LedBar';

export default class BciScanner extends PIXI.Container {
  constructor() {
    super();

    this._clickSound = new Howl({
      src: ['/audio/click.mp3'],
      loop: false,
      volume: 0.3,
    });

    this._powerSound = new Howl({
      src: ['/audio/power_up.mp3'],
      loop: false,
      volume: 0.5,
    });

    this._customer = null;
    this._isAnimating = false;

    this._masterContainer = new PIXI.Container();

    this._bg  = PIXI.Sprite.from(GameAssets.assets['img/bci_scanner.png']);
    this.addChild(this._bg);
    this.addChild(this._masterContainer);

    this._ledBar = new LedBar();
    this.addChild(this._ledBar);

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
    this._masterContainer.addChild(this._titleLabel);

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
    this._masterContainer.addChild(this._userIdLabel);

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
    this._masterContainer.addChild(this._pagesLabel);

    let horizontalLine = new PIXI.Graphics();
    horizontalLine.rect(0, 0, 370, 3)
      .fill(0xdec583);
    this._masterContainer.addChild(horizontalLine);
    horizontalLine.x = 200;
    horizontalLine.y = 210;

    horizontalLine = new PIXI.Graphics();
    horizontalLine.rect(0, 0, 370, 3)
      .fill(0xdec583);
    this._masterContainer.addChild(horizontalLine);
    horizontalLine.x = 200;
    horizontalLine.y = 550;

    this._upButton = new PIXI.Sprite(GameAssets.assets['img/bci_up.png']);
    this.addChild(this._upButton);
    this._upButton.x = 609;
    this._upButton.y = 210;
    this._upButton.interactive = true;
    this._upButton.cursor = 'pointer';
    this._upButton.alpha = 0;
    this._upButton.on('pointerdown', () => {
      this._upButton.alpha = 1;
      this.setPageIndex((this._currentPageIndex + 1) % this._pages.length);
      this._clickSound.play();
      this._ledBar.setLed(3, 1);
      this._ledBar.setLed(0, 0);
      this._ledBar.setLed(1, 0);
      this._ledBar.setLed(2, 0);
      this._ledBar.setLed(this._currentPageIndex, 1);
    });
    this._upButton.on('pointerup', () => {
      this._upButton.alpha = 0;
      this._ledBar.setLed(3, 0);
    });

    this._downButton = new PIXI.Sprite(GameAssets.assets['img/bci_down.png']);
    this.addChild(this._downButton);
    this._downButton.x = 607;
    this._downButton.y = 458;
    this._downButton.interactive = true;
    this._downButton.cursor = 'pointer';
    this._downButton.alpha = 0;
    this._downButton.on('pointerdown', () => {
      this._downButton.alpha = 1;
      this.setPageIndex((this._currentPageIndex - 1 + this._pages.length) % this._pages.length);
      this._clickSound.play();
      this._ledBar.setLed(3, 1);
      this._ledBar.setLed(0, 0);
      this._ledBar.setLed(1, 0);
      this._ledBar.setLed(2, 0);
      this._ledBar.setLed(this._currentPageIndex, 1);
    });
    this._downButton.on('pointerup', () => {
      this._downButton.alpha = 0;
      this._ledBar.setLed(3, 0);
    });

    this._offButton = new PIXI.Sprite(GameAssets.assets['img/bci_off.png']);
    this.addChild(this._offButton);
    this._offButton.x = 608;
    this._offButton.y = 325;
    this._offButton.interactive = true;
    this._offButton.cursor = 'pointer';
    this._offButton.alpha = 0;
    this._offButton.on('pointerdown', () => {
      this._offButton.alpha = 1;
      this._clickSound.play();
      this._ledBar.setLed(3, 1);
    });
    this._offButton.on('pointerup', () => {
      this._offButton.alpha = 0;
      this.emit('close');
      this._ledBar.setLed(0, 0);
      this._ledBar.setLed(1, 0);
      this._ledBar.setLed(2, 0);
      this._ledBar.setLed(3, 0);
      this._ledBar.setPower(0);
    });
    
    this._currentPageIndex = 0;
    this._pages = [
      new BciScorePage(),
      new BciHistoryPage(),
      new BciProfilePage(),
    ]
    this._currentPage = 0;
    this._pagesContainer = new PIXI.Container();
    this._masterContainer.addChild(this._pagesContainer);
    this._pagesContainer.x = 400 - 200
    this._pagesContainer.y = 400 - 180

    this._pageMask = new PIXI.Graphics();
    this.addChild(this._pageMask);
    this._pageMask.rect(-390/2, -430/2, 390, 430)
      .fill(0x0000ff);
    this._pageMask.x = 385;
    this._pageMask.y = 380;
    this._masterContainer.mask = this._pageMask;

    this._powerOverlay = new PIXI.Graphics();
    this.addChild(this._powerOverlay);
    this._powerOverlay.x = 385;
    this._powerOverlay.y = 380;
   
    this.setPageIndex(0);
  }

  powerOn() {
    // Prevent multiple animations from running simultaneously
    if (this._isAnimating) {
      return;
    }
    
    this._isAnimating = true;
    
    const anim = async () => {
      try {
        this._ledBar.setLed(0, 0);
        this._ledBar.setLed(1, 0);
        this._ledBar.setLed(2, 0);
        this._ledBar.setLed(3, 0);
        this._ledBar.setPower(0);
        this._pageMask.scale.set(1, 0);
        
        for(let i = 0.0; i < 1; i+=0.15) {
          await new Promise(resolve => setTimeout(resolve, 30));
          this._powerOverlay.clear();
          const w = 390 * i;
          this._powerOverlay.rect(-5, -5, 10, 10)
            .fill({color: 0xdec583, alpha: i});
        }
        
        this._powerSound.play();
        this._ledBar.setLed(0, 1);
        
        for(let i = 0.0; i < 1; i+=0.15) {
          await new Promise(resolve => setTimeout(resolve, 30));
          this._powerOverlay.clear();
          const w = 390 * i;
          this._powerOverlay.rect(-w/2, -5, w, 10)
            .fill(0xdec583);;
        }
        
        this._ledBar.setLed(1, 1);
        
        for(let i = 1; i > 0; i-=0.2) {
          await new Promise(resolve => setTimeout(resolve, 30));
          this._powerOverlay.clear();
          const y = 0.5 * 430 * (1-i);
          this._powerOverlay
            .rect(-390/2, -y-5, 390, 10)
            .rect(-390/2, +y-5, 390, 10)
            .fill({color: 0xdec583, alpha: i})
          this._pageMask.scale.set(1, 1-i);
          this._masterContainer.alpha = Math.random() > i ? (1-i) : 0;
        }
        
        this._ledBar.setLed(2, 1);
        this._ledBar.setPower(1);
        this._powerOverlay.clear();
        
        // Ensure proper state after scaling animation
        this._pageMask.scale.set(1, 1);
        this._masterContainer.alpha = 1;
        
        // Flickering effect with guaranteed final state
        for(let i = 0; i < 1; i+=0.1) {
          await new Promise(resolve => setTimeout(resolve, 30));
          this._masterContainer.alpha = Math.random();
        }
        
        // Guarantee final visibility
        this._masterContainer.alpha = 1;
        this._ledBar.setLed(3, 1);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this._ledBar.setLed(0, 0);
        this._ledBar.setLed(1, 0);
        this._ledBar.setLed(2, 0);
        this._ledBar.setLed(3, 0);
        this._ledBar.setLed(this._currentPageIndex, 1);
        
      } catch (error) {
        console.error('Animation error:', error);
        // Ensure proper cleanup even if animation fails
        this._masterContainer.alpha = 1;
        this._pageMask.scale.set(1, 1);
      } finally {
        this._isAnimating = false;
      }
    }

    anim();
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