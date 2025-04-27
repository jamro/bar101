import * as PIXI from 'pixi.js';
import MasterContainer from "../MasterContainer";
import BarTable from './BarTable';

class BarCustomerMasterContainer extends MasterContainer {
  constructor() {
    super();

    this._barTable = new BarTable();
    this.addChild(this._barTable);
  }

  resize(width, height) {
    const scaleW = width / this._barTable.initWidth;
    const scaleH = height / this._barTable.initHeight;
    const scale = Math.min(scaleW, scaleH);
    this._barTable.scale.set(scale);
    this._barTable.x = (width - this._barTable.initWidth * scale) / 2;
    this._barTable.y = (height - this._barTable.initHeight * scale) / 2;
  }

  setCustomer(customer) {
    this._barTable.setCustomer(customer);
  }

  setDrink(drink) {
    this._barTable.setDrink(drink);
  }

}

export default BarCustomerMasterContainer;