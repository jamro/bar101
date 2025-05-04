import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import BarTable from './BarTable';
import TrustMeter from './TrustMeter';
import BalanceMeter from './BalanceMeter';
import GameAssets from '../GameAssets';
class BarCustomerMasterContainer extends MasterContainer {
  constructor() {
    super();
    this._customer = null;
    this._barTable = new BarTable();
    this.addChild(this._barTable);

    this._trustMeter = new TrustMeter();
    this._trustMeter.x = 0;
    this._trustMeter.y = 0;
    this.addChild(this._trustMeter);

    this._balanceMeter = new BalanceMeter
    this._balanceMeter.x = 0;
    this._balanceMeter.y = 0;
    this.addChild(this._balanceMeter);

    this._bciButtonAvailable = false;
    this._bciButton = null
  }

  init() {
    if(this._bciButton) {
      this.removeChild(this._bciButton);
    }
    this._bciButton = new PIXI.Sprite(GameAssets.assets['img/bci_button.png']);
    this._bciButton.interactive = true;
    this._bciButton.buttonMode = true;
    this._bciButton.anchor.set(0, 1);
    this._bciButton.on('pointerdown', () => {
      this.emit('bciToggle');
    });
    this.addChild(this._bciButton);
    if(this._customer) {
      this._bciButton.visible = (this._customer.id !== 'trader');
    }
    this._bciButton.visible = this._bciButtonAvailable;
  }

  resize(width, height) {
    const scaleW = width / this._barTable.initWidth;
    const scaleH = height / this._barTable.initHeight;
    const scale = Math.min(scaleW, scaleH);
    this._barTable.scale.set(scale);
    this._barTable.x = (width - this._barTable.initWidth * scale) / 2;
    this._barTable.y = (height - this._barTable.initHeight * scale) / 2;
    this._trustMeter.scale.set(scale);
    this._trustMeter.x = width - this._trustMeter.width  - 40;
    this._trustMeter.y = 20
    this._balanceMeter.scale.set(scale);
    this._balanceMeter.x = 40;
    this._balanceMeter.y = 20

    this._bciButton.scale.set(scale*1.1);
    this._bciButton.x = 40
    this._bciButton.y = height - 20;
  }

  setBalance(balance) {
    this._balanceMeter.cash = balance;
  }

  setCustomer(customer, anim=false) {
    this._customer = customer;
    if(customer && customer.trust !== undefined) {
      this._trustMeter.alpha = 1;
      this._trustMeter.trust = customer.trust;
    } else {
      this._trustMeter.alpha = 0;
    }
    this._barTable.setCustomer(customer, anim);
    this._updateBciButtonVisibility();
  }

  setDrink(drink, anim=false) {
    this._barTable.setDrink(drink, anim);
  }

  setBciAvailable(available) {
    this._bciButtonAvailable = available;
    this._updateBciButtonVisibility();
  }

  _updateBciButtonVisibility() {
    if(!this._customer || !this._bciButton) {
      return;
    }
    this._bciButton.visible = (this._customer.id !== 'trader' && this._bciButtonAvailable);
  }

}

export default BarCustomerMasterContainer;