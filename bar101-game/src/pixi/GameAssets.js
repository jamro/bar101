import * as PIXI from 'pixi.js';

class GameAssets {
  constructor() {
    this.assets = {};
    this.ready = false;
    this.loadingQueue = [
      'img/bar101_entrence.jpg',
      'img/bar101_entrence_off.png',
      'img/bar101_entrence_led.png',
      'img/bar_bg.jpg',
      'img/dtomenko.png',
      'img/lkova.png',
      'img/npetrak.png',
      'img/olintz.png',
      'img/rmiskovic.png',
      'img/shalek.png',
      'img/trader.png',
      'img/rocks.png',
      'img/coupe.png',
      'img/tv.jpg',
      'img/news_official.jpg',
      'img/news_underground.jpg',
      'img/news_official_splash.jpg',
      'img/news_underground_splash.jpg',
      'img/drop.png',
      'img/table_texture.png',
      'img/wall.jpg',
      'img/shelf.png',
      'img/bottle_rum.png',
      'img/bottle_simple_syrup.png',
      'img/bottle_whiskey.png',
      'img/bottle_gin.png',
      'img/bottle_triple_sec.png',
      'img/bottle_vermouth.png',
      'img/bottle_lime_juice.png',
      'img/bottle_absinthe.png',
      'img/bottle_simple_syrup_glow.png',
      'img/bottle_whiskey_glow.png',
      'img/bottle_gin_glow.png',
      'img/bottle_triple_sec_glow.png',
      'img/bottle_vermouth_glow.png',
      'img/bottle_lime_juice_glow.png',
      'img/bottle_rum_glow.png',
      'img/shaker_bottom.png',
      'img/shaker_middle.png',
      'img/shaker_top.png',
      'img/shaker_special.png',
      'img/recipes.png',
      'img/recipes_glow.png',
      'img/paper.jpg',
      'img/rocks_drawing.png',
      'img/coupe_drawing.png',
      'img/bci_scanner.png',
      'img/bci_button.png',
      'img/exit_button.png',
      'img/exit_ok_button.png',
      'img/exit_cancel_button.png',
      'img/bci_up.png',
      'img/bci_down.png',
      'img/bci_off.png',
      'img/warning.png',
      'img/led.png',
      'img/shaker_glow.png',
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