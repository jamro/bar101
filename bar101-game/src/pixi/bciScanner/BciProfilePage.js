import BciScannerPage from './BciScannerPage';
import * as PIXI from 'pixi.js';

const hobbyNames = {
  origami: "Origami",
  typewriter: "Old Typewriters",
  fpv_drone: "FPV Drones",
  urban_exploration: "Urban Exploration",
  political_literature: "Literature",
  analog_photography: "Photography",
}

const drinkNames = {
  sidecar: "Sidecar",
  old_fashioned: "Old Fashioned",
  gimlet: "Gimlet",
  negroni: "Negroni",
  martini: "Martini",
  daiquiri: "Daiquiri",
}

export default class BciProfilePage extends BciScannerPage {
  constructor() {
    super();


    this._nameLabel = new PIXI.Text({
      text: '???',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 40,
        fill: 0xffffff,
        align: 'center'
      }
    });
    this.addChild(this._nameLabel);
    this._nameLabel.anchor.set(0.5, 0);
    this._nameLabel.x = 370/2
    this._nameLabel.y = 0
    this.addChild(this._nameLabel);

    this._jobTitleLabel = new PIXI.Text({
      text: '???',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 25,
        fill: 0xffffff,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 350
      }
    });
    this.addChild(this._jobTitleLabel);
    this._jobTitleLabel.anchor.set(0.5, 0.5);
    this._jobTitleLabel.x = 370/2
    this._jobTitleLabel.y = 80

    let horizontalLine = new PIXI.Graphics();
    horizontalLine.rect(0, 0, 370, 3)
      .fill(0xffffff);
    this.addChild(horizontalLine);
    horizontalLine.x = 0;
    horizontalLine.y = 120;

    this._detailsLabel = new PIXI.Text({
      text: '???',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 27,
        fill: 0xdec583,
        lineHeight: 35,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: 370
      }
    });
    this.addChild(this._detailsLabel);
    this._detailsLabel.anchor.set(0, 0);
    this._detailsLabel.x = 0;
    this._detailsLabel.y = 135;

    this._warningIcon = new PIXI.Sprite(PIXI.Texture.from('img/warning.png'));
    this.addChild(this._warningIcon);
    this._warningIcon.anchor.set(0.5, 0.5);
    this._warningIcon.scale.set(0.2)
    this._warningIcon.x = 370/2;
    this._warningIcon.y = 60;
    this._warningIcon.visible = false
  }

  setData(data) {
    if(data.inventory && data.inventory.files && data.inventory.files.includes(data.customer.id)) {
      this._nameLabel.visible = true
      this._jobTitleLabel.visible = true
      this._warningIcon.visible = false
      this._detailsLabel.style.fill = 0xdec583
      this._nameLabel.text = data.customer.name
      this._jobTitleLabel.text = data.customer.job_title
      this._detailsLabel.text = "Age: " + data.customer.age + "\n"
        + "Gender: " + data.customer.sex + "\n"
        + "Affiliation: " + data.customer.political_preference[0].toUpperCase() + data.customer.political_preference.slice(1) + "\n"
        + "Drink: " + drinkNames[data.customer.drink] + "\n"
        + "Hobby: " + hobbyNames[data.customer.hobby_id]
    } else {
      this._detailsLabel.text = `No personal records found for user ${data.customer.id}`
      this._detailsLabel.style.fill = 0xa54200
      this._nameLabel.visible = false
      this._jobTitleLabel.visible = false
      this._warningIcon.visible = true
    }

  }
}