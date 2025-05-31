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

  powerOn() {
    this._bciScanner.powerOn();
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

BciScannerMasterContainer.instance = null;

BciScannerMasterContainer.getInstance = () => {
  if(!BciScannerMasterContainer.instance) {
    BciScannerMasterContainer.instance = new BciScannerMasterContainer();
  }
  return BciScannerMasterContainer.instance;
}

export default BciScannerMasterContainer;