import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import BciScanner from './BciScanner';

class BciScannerMasterContainer extends MasterContainer {
  constructor() {
    super();
    this._bciScanner = new BciScanner();
    this.addChild(this._bciScanner);
    this._bciScanner.on('close', () => {
      this.emit('close');
    });
  }

  setData(data) {
    this._bciScanner.setData(data);
  }

  resize(width, height) {
    const scaleW = width / this._bciScanner.deviceWidth;
    const scaleH = height / this._bciScanner.deviceHeight;
    const scale = Math.min(scaleW, scaleH);
    this._bciScanner.scale.set(scale);
    this._bciScanner.x = (width - this._bciScanner.deviceWidth * scale) / 2;
    this._bciScanner.y = (height - this._bciScanner.deviceHeight * scale) / 2;
  }

}

export default BciScannerMasterContainer;