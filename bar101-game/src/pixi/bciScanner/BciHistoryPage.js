import BciScannerPage from './BciScannerPage';
import * as PIXI from 'pixi.js';

export default class BciHistoryPage extends BciScannerPage {
  
  constructor() {
    super();

    this._graph = new PIXI.Graphics();
    this._graph.x = 10
    this._graph.y = 10
    this.addChild(this._graph);

    this._titleLabel = new PIXI.Text({
      text: 'BCI History',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 40,
        fill: 0xdec583,
        align: 'center',
      }
    })
    this.addChild(this._titleLabel);
    this._titleLabel.anchor.set(0.5, 0);
    this._titleLabel.x = 370/2
    this._titleLabel.y = 270

    this._noRecordsContainer = new PIXI.Container();
    this.addChild(this._noRecordsContainer);
    this._noRecordsContainer.x = this._graph.x
    this._noRecordsContainer.y = this._graph.y

    const bg = new PIXI.Graphics();
    bg.rect(0, 0, 250, 250).fill({color: 0x000000}).stroke({color: 0xffffff, width: 4})
    this._noRecordsContainer.addChild(bg);

    const label = new PIXI.Text({
      text: 'No personal\nrecords found',
      style: {
        fontFamily: 'Chelsea Market',
        fontSize: 30,
        fill: 0xff0000,
        align: 'center',
      }
    })
    this._noRecordsContainer.addChild(label);
    label.anchor.set(0.5, 0.5);
    label.x = 125
    label.y = 125
   
    
  }

  setData(data) {
    if(data.inventory && data.inventory.files && data.inventory.files.includes(data.customer.id)) {
      this._noRecordsContainer.visible = false;
    } else {
      this._noRecordsContainer.visible = true;
    }
    
    const graphWidth = 350;
    const graphHeight = 250;
    this._graph.clear();


    let bciData = data.customer.bci_history ? data.customer.bci_history.slice(-10) : [];
    bciData = [...bciData]
    if(bciData.length < 1) return;
    const step = graphWidth / (bciData.length-1);
    const yStep = graphHeight / 10;

    // draw grid
    for (let i = 0; i <= graphWidth; i+=step) {
      for (let j = 0; j <= graphHeight; j+=yStep) {
        this._graph.rect(i-4, j-2, 8, 4).fill({color: 0xdec583, alpha: 0.25})
        this._graph.rect(i-2, j-4, 4, 8).fill({color: 0xdec583, alpha: 0.25})
      }
    }

    // draw chart
    this._graph.moveTo(0, graphHeight);
    for (let i = 0; i < bciData.length; i++) {
      this._graph.lineTo(i * step, graphHeight - bciData[i] * (graphHeight / 100));
    }
    this._graph.lineTo(graphWidth, graphHeight);
    this._graph.lineTo(0, graphHeight);
    this._graph.fill({color: 0xdec583, alpha: 0.5});

    this._graph.moveTo(0, graphHeight - bciData[0] * (graphHeight / 100));
    for (let i = 0; i < bciData.length; i++) {
      this._graph.lineTo(i * step, graphHeight - bciData[i] * (graphHeight / 100));
    }
    this._graph.stroke({color: 0xffffff, width: 6});

    for (let i = 1; i < bciData.length-1; i++) {
      this._graph.circle(i * step, graphHeight - bciData[i] * (graphHeight / 100), 7).fill(0xffffff);
    }

    // draw frame
    this._graph.rect(0, 0, graphWidth, graphHeight)
      .stroke({color: 0xffffff, width: 4})

    
  }

}