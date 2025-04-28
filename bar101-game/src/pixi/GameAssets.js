import * as PIXI from 'pixi.js';

class GameAssets {
  constructor() {
    this.assets = {};
    this.ready = false;
    this.loadingQueue = [
      'img/bar_bg.png',
      'img/dtomenko.png',
      'img/lkova.png',
      'img/npetrak.png',
      'img/olintz.png',
      'img/rmiskovic.png',
      'img/shalek.png',
      'img/rocks.png',
      'img/coupe.png',
      'img/tv.png',
      'img/news_official.png',
      'img/news_underground.png',
    ];
  }

  async loadAssets() {
    if (this.ready) {
      console.log('[GameAssets] Assets are already loaded. No need to load again.');
      return;
    }
    const loadingPromises = this.loadingQueue.map((asset) => {
      return new Promise(async (resolve, reject) => {
        try {
          const texture = await PIXI.Assets.load(asset);
          this.assets[asset] = texture;
          resolve();
        } catch (error) {
          console.error(`Error loading asset ${asset}:`, error);
          reject(error);
        }
      });
    })

    await Promise.all(loadingPromises);
    this.ready = true;
  }

}

const assets = new GameAssets();

export default assets;