import * as PIXI from 'pixi.js';

export default class BciScannerPage extends PIXI.Container {
  constructor() {
    super();

    this._scoreLabel = new PIXI.Text({
      text: '???',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 140,
        fill: 0xdec583,
        align: 'center'
      }
    })
    this.addChild(this._scoreLabel);
    this._scoreLabel.anchor.set(0.5, 0.5);
    this._scoreLabel.x = 370/2
    this._scoreLabel.y = 70

    this._headerLabel = new PIXI.Text({
      text: '???',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 40,
        fill: 0xdec583,
        align: 'center'
      }
    })
    this.addChild(this._headerLabel);
    this._headerLabel.anchor.set(0.5, 0.5);
    this._headerLabel.x = 370/2
    this._headerLabel.y = 200

    this._descriptionLabel = new PIXI.Text({
      text: '???',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 20,
        fill: 0xdec583,
        align: 'center'
      }
    })
    this.addChild(this._descriptionLabel);
    this._descriptionLabel.anchor.set(0.5, 0.5);
    this._descriptionLabel.x = 370/2
    this._descriptionLabel.y = 290

  }

  setData(data) {
    /*
    80-100: Fully aligned, secure access, trusted/Council-tier; 
    60-79: Generally compliant, maybe “eccentric” but not flagged; 
    40-59: Risk indicators present. Tolerated but monitored; 
    20-39: Noncompliant, flagged, subject to restrictions; 
    0-9: Rogue/dissident, denied services, likely ghosted by the system.
    */
    this._scoreLabel.text = data.customer.bci_score;
    this._scoreLabel.style.fill = this._scoreLabel.text >= 40 ? 0xdec583 : 0xa54200;
    this._headerLabel.style.fill = this._scoreLabel.text >= 40 ? 0xdec583 : 0xa54200;

    if (data.customer.bci_score >= 80) {
      this._headerLabel.text = 'Fully\naligned';
      this._descriptionLabel.text = 'Secure access,\ntrusted/Council-tier';
    } else if (data.customer.bci_score >= 60) {
      this._headerLabel.text = 'Generally\ncompliant';
      this._descriptionLabel.text = 'Maybe "eccentric"\nbut not flagged';
    } else if (data.customer.bci_score >= 40) {
      this._headerLabel.text = 'Risk\nindicators';
      this._descriptionLabel.text = 'Tolerated but\nmonitored';
    } else if (data.customer.bci_score >= 20) {
      this._headerLabel.text = 'Noncompliant';
      this._descriptionLabel.text = 'Flagged, subject\nto restrictions';
    } else {
      this._headerLabel.text = 'Rogue,\ndissident';
      this._descriptionLabel.text = 'Denied services,\nlikely ghosted';
    }
    this._headerLabel.text = this._headerLabel.text.toUpperCase();

  }

  
}