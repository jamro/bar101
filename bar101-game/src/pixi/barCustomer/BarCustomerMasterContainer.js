import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import BarTable from './BarTable';
import TrustMeter from './TrustMeter';
import BalanceMeter from './BalanceMeter';

class BarCustomerMasterContainer extends MasterContainer {
  constructor() {
    super();

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
  }

  setBalance(balance) {
    this._balanceMeter.cash = balance;
  }

  setCustomer(customer, anim=false) {
    if(customer && customer.trust !== undefined) {
      this._trustMeter.alpha = 1;
      this._trustMeter.trust = customer.trust;
    } else {
      this._trustMeter.alpha = 0;
    }
    this._barTable.setCustomer(customer, anim);
  }

  setDrink(drink, anim=false) {
    this._barTable.setDrink(drink, anim);
  }

}

export default BarCustomerMasterContainer;