import * as PIXI from 'pixi.js';
import Bottle from './Bottle';
import Shaker from './Shaker';
import Liquid from './Liquid';
import IngredientsDisplay from './IngredientsDisplay';
import Table from './Table';
import GameAssets from '../GameAssets';
import Shelfs from './Shelfs';
import WallItems from './WallItems';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';
const SHAKER_CAPACITY = 90

function getIngredients(drinks) {
  const ingredientsMap = {};
  const allDrinks = Object.values(drinks);
  for (const drink of allDrinks) {
    for (const ingredient of drink.ingredients) {
      if (!ingredientsMap[ingredient.id]) {
        ingredientsMap[ingredient.id] = {
          id: ingredient.id,
          name: ingredient.name,
        }
      }
    }
  }
  return Object.values(ingredientsMap);
}

export default class CocktailView extends PIXI.Container {

  constructor(drinks) {
    super()
    if (drinks.length === 0) {
      console.warn("[CocktailMasterContainer] No drinks to display");
      return;
    }
    this._loopRegister = [];
    this._endingAnimationPlaying = false;
    this._currentDrinkIngredients = {}
    this._shakerContent = 0;
    this._drinks = drinks;
    this._ingredients = getIngredients(drinks);
    this._mode = LANDSCAPE;

    // bakckround
    this._background = new PIXI.Sprite(GameAssets.assets['img/wall.jpg']);
    this._background.anchor.set(0.5);
    this.addChild(this._background);

    // recipes
    this._wallItems = new WallItems();
    this.addChild(this._wallItems);
    this._wallItems.on('openRecipes', () => {
      this._endDrag();
      this._endShaking();
      this.emit('openRecipes');
    });

    this._table = new Table();
    this.addChild(this._table);

    // ingridients display
    this._ingredientsDisplay = new IngredientsDisplay();
    this.addChild(this._ingredientsDisplay);
    this._ingredientsDisplay.showHint("Grab a bottle and start pouring");

    // shaker
    this._shaker = new Shaker();
    this.addChild(this._shaker);
    this._shaker.on('pointerdown', (event) => this._startShaking(event));
    this._shaker.on('pointerup', (event) => this._endShaking(event));
    this._shaker.on('pointerupoutside', (event) => this._endShaking(event));

    // liquid particles
    this._liquid = new Liquid();
    this.addChild(this._liquid);

    // bottles
    this._shelfs = new Shelfs(this._ingredients)
    this.addChild(this._shelfs);
    this._dragTarget = null;
    this._shelfs.bottles.forEach((bottle) => {
      bottle.on('pointerdown', (event) => this._startDrag(event));
      bottle.on('pointerup', (event) => this._endDrag(event));
      bottle.on('pointerupoutside', (event) => this._endDrag(event));
    })

    // drag event hadling
    this.interactive = true;
    this.on('pointermove', this._onDragMove);
    this._dragPointer = {x: 0, y: 0};
    this._pourPoint = {x: 0, y: 0};

    // rendering / update
    let loop
    this.on('added', () => {
      loop = this.setInterval(() => this._update(), 1000/60);
    })
    this.on('removed', () => {
      this.clearInterval(loop)
    })

    // init positioning
    this.setLandscapeMode()
  }

  setInterval(func, delay) {
    const interval = setInterval(func, delay);
    this._loopRegister.push(interval);
    return interval;
  }
  clearInterval(interval) {
    clearInterval(interval);
    this._loopRegister = this._loopRegister.filter(i => i !== interval);
  }

  clearAllIntervals() {
    while (this._loopRegister.length > 0) {
      const interval = this._loopRegister.pop();
      console.log("clearing interval", interval);
      clearInterval(interval);
    }
  }

  destroy() {
    super.destroy();
    this.clearAllIntervals();
  }

  _pour(ingredientId, amount) {
    if(this._shakerContent >= SHAKER_CAPACITY) {
      return;
    }
    if(!this._currentDrinkIngredients[ingredientId]) {
      this._currentDrinkIngredients[ingredientId] = {
        id: ingredientId,
        name: this._ingredients.find(ingredient => ingredient.id === ingredientId).name,
        amount: 0, 
        timestamp: 0
      };
    }
    
    this._currentDrinkIngredients[ingredientId].amount += amount;
    this._currentDrinkIngredients[ingredientId].timestamp = performance.now();
    
    this._shakerContent = Object.values(this._currentDrinkIngredients).reduce((acc, ingredient) => acc + Math.round(ingredient.amount), 0)
    this._shaker.resetProgress()
  }

  _startShaking(event) {
    if (this._shakerContent == 0 || this._shaker.progress >= 1) {
      return;
    }
    this._shaker.startShaking()
  }

  _endShaking(event) {
    this._shaker.endShaking()
    if(this._shaker.progress >= 1) {
      this.serveDrink()
    }
  }

  serveDrink() {
    const match = this._matchDrink();
    let drink
    if (!match) {
      drink = {
        id: "unknown",
        quality: 0,
        special: false,
        glass: Math.random() > 0.5 ? "rocks" : "coupe",
      }
    } else {
      const quality = this._calcDrinkQuality(match);
      drink = {
        ...match,
        quality,
        special: false,
      }
    }

    this.playEndingAnimation(drink);
    
  }

  _matchDrink() {
    let foundDrink = null;
    const allDrinks = Object.values(this._drinks);
    const allCurrentIngredients = Object.values(this._currentDrinkIngredients);
    for (const drink of allDrinks) {
      if (drink.ingredients.length !== allCurrentIngredients.length) {
        continue;
      }
      let wrongIngredient = false;
      for (const ingredient of drink.ingredients) {
        if(!allCurrentIngredients.find(x => x.id === ingredient.id)) {
          wrongIngredient = true;
          break;
        }
      }
      if (wrongIngredient) {
        continue;
      }
      foundDrink = drink;
      break
    }
    return foundDrink
  }

  _calcDrinkQuality(drinkMatch) {
    const vec1 = drinkMatch.ingredients
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(x => x.amount)
    const vec2 = Object.values(this._currentDrinkIngredients)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(x => x.amount)

    const sumSquaredDiffs = vec1.reduce((sum, val, i) => {
      return sum + Math.pow(val - vec2[i], 2);
    }, 0);
  
    const distanceThreshold = 50
    const distance = Math.min(Math.sqrt(sumSquaredDiffs), distanceThreshold)
      
    return 1 - (distance / distanceThreshold);
  }
    

  _startDrag(event) {
    if (this._shaker.shaking || this._shaker.progress >= 1) {
      return;
    }
    const localX = event.x/this.scale.x - this.x/this.scale.x;
    const localY = event.y/this.scale.y - this.y/this.scale.y;
    this._dragPointer.x = localX;
    this._dragPointer.y = localY;
    this._dragTarget = event.currentTarget;
    this._dragTarget.parent.setChildIndex(this._dragTarget, this._dragTarget.parent.children.length - 1);
  }

  _endDrag(event) {
    this._dragTarget = null;
  }

  _onDragMove(event) {
    const localX = event.x/this.scale.x - this.x/this.scale.x;
    const localY = event.y/this.scale.y - this.y/this.scale.y;
    this._dragPointer.x = localX;
    this._dragPointer.y = localY;
  }

  _update() {
    if (this._dragTarget && !this._endingAnimationPlaying) {
      this._dragTarget.tipX = this._dragPointer.x - this._shelfs.x;
      this._dragTarget.y = this._dragPointer.y - this._shelfs.y + this._dragTarget.yShift;
      this._liquid.cutOffY = this._shaker.y;
      
      const pourDistanceX = this._pourPoint.x - this._shelfs.x - this._dragTarget.tipX
      const pourDistanceY = this._pourPoint.y - this._dragPointer.y - this._dragTarget.yShift/2

      const initRangeMin = 100;
      const initRangeMax = 800;
      const initialRotationAmount =  (1-(Math.min(initRangeMax, Math.max(initRangeMin, pourDistanceX)) - initRangeMin)/(initRangeMax - initRangeMin))
      let targetBottleRotation = initialRotationAmount * Math.PI*0.45
      const endRangeMin = 150;
      const endRangeMax = 800;
      const endRotationAmount =  (1-(Math.min(endRangeMax, Math.max(endRangeMin, (pourDistanceY))) - endRangeMin)/(endRangeMax - endRangeMin))
      const maxRotation = Math.PI*(0.4 + 0.6*endRotationAmount);

      this._dragTarget.y -= (1-initialRotationAmount) * this._dragTarget.yShift*0.5;
    
      if (Math.abs(pourDistanceX) > this._shaker.bottleneckWidth/2 || this._shakerContent >= SHAKER_CAPACITY) {
        this._liquid.amount = 0;
      } else {
        this._liquid.amount = Math.max(0, (this._dragTarget.rotation - 0.5*Math.PI)/(0.5*Math.PI))
        targetBottleRotation = Math.max(targetBottleRotation, maxRotation)
      }

      this._dragTarget.rotation += (targetBottleRotation - this._dragTarget.rotation) * (this._dragTarget.rotation < Math.PI/2 ? 0.03 : 0.01)

      this._dragTarget.y -= (this._dragTarget.rotation/Math.PI)*this._dragTarget.yShift + 0.5*(1-endRotationAmount)*this._dragTarget.yShift

      const pourPintLimit = this._pourPoint.y - this._shelfs.y - 50 + Math.abs(pourDistanceX)
      this._dragTarget.tipY = Math.min(this._dragTarget.tipY, pourPintLimit);

      this._liquid.source.x = this._dragTarget.tipX + this._shelfs.x
      this._liquid.source.y = this._dragTarget.tipY + this._shelfs.y
    } else if (!this._endingAnimationPlaying) {
      this._liquid.amount = 0;
    }
    for (let i = 0; i < this._shelfs.bottles.length; i++) {
      const bottle = this._shelfs.bottles[i];
      if (this._dragTarget !== bottle) {
        bottle.x += (bottle.initX - bottle.x) * 0.1;
        bottle.y += (bottle.initY - bottle.y) * 0.1;
        bottle.rotation += (0 - bottle.rotation) * 0.1;
      }
    }

    this._liquid.update();
    if(this._liquid.amount > 0 && this._dragTarget && !this._endingAnimationPlaying) {
      this._pour(this._dragTarget.id, this._liquid.amount/4);
      this._ingredientsDisplay.update(this._currentDrinkIngredients);
    }

    if (this._shaker.shaking && !this._endingAnimationPlaying) {
      this._ingredientsDisplay.alpha += (0 - this._ingredientsDisplay.alpha) * 0.1;
      this._shaker.updateShaking(
        this._dragPointer.x,
        this._dragPointer.y - this._shaker.graphicHeight/2
      );
      if (this._shaker.progress >= 1) {
        this._endShaking();
      }
    } else if (!this._endingAnimationPlaying) {
      this._ingredientsDisplay.alpha += (1 - this._ingredientsDisplay.alpha) * 0.1;
      this._shaker.postShaking();
    }

    if (this._shakerContent >= SHAKER_CAPACITY && this._shaker.progress < 1 && !this._endingAnimationPlaying) {
      this._endDrag();
      this._shaker.open(0);
      this._ingredientsDisplay.showHint("Time to shake!")
    } 
  }

  async playEndingAnimation(drink) {
    if (this._endingAnimationPlaying) {
      return;
    }
    this._endingAnimationPlaying = true;
    this._shaker.open(1);
    this._ingredientsDisplay.showHint("")

    const glass = new PIXI.Sprite(GameAssets.assets['img/' + drink.glass + '.png']);
    glass.anchor.set(0.5, 1);
    glass.x = this._pourPoint.x + 500;
    glass.y = this._pourPoint.y + 200;
    glass.alpha = 0;
    glass.scale.set(1.5);
    this.addChild(glass);
    glass.parent.setChildIndex(glass, this._shaker.parent.getChildIndex(this._shaker));

    if (drink.glass === "rocks") {
      this._liquid.cutOffY = glass.y - 110
    } else {
      this._liquid.cutOffY = glass.y - 200
    }

    await new Promise((resolve) => {
      let animLoop =  null
      animLoop = this.setInterval(() => {
        const dx = this._pourPoint.x - 100 - this._shaker.x;
        const dy = this._pourPoint.y - 300 - this._shaker.y;
        const gx = this._pourPoint.x - glass.x - 30;
        const ga = 1 - glass.alpha;
        this._shaker.x += dx * 0.05;
        this._shaker.y += dy * 0.05;
        glass.x += gx * 0.05;
        glass.alpha += ga * 0.05;
        this._shaker.postShaking();
        if(Math.abs(dx) < 5 && Math.abs(dy) < 5 && Math.abs(gx) < 5 && Math.abs(ga) < 0.01) {
          this.clearInterval(animLoop);
          resolve();
        }
      }, 1000/60);
    })

    await new Promise((resolve) => {
      let animLoop =  null
      animLoop = this.setInterval(() => {
        const rx = Math.PI*0.75 - this._shaker.rotation;
        this._shaker.rotation += rx * 0.04;
        this._shaker.postShaking();

        this._liquid.source.x = this._shaker.x + 60 * Math.cos(this._shaker.rotation - Math.PI/2);
        this._liquid.source.y = this._shaker.y + 60 * Math.sin(this._shaker.rotation - Math.PI/2);
        this._liquid.amount = Math.max(0, (this._shaker.rotation - 0.5*Math.PI)/(0.5*Math.PI))

        if(Math.abs(rx) < 0.02) {
          this._liquid.amount = 0;
          this.clearInterval(animLoop);
          resolve();
        }
      }, 1000/60);
    })

    this.emit('serveDrink', drink);
  }
  
  setLandscapeMode() {
    this._mode = LANDSCAPE;
  
    this._pourPoint = {
      x: this.segmentSize*1.75, 
      y: 770
    };

    this._shelfs.x = 200;
    this._shelfs.y = 430;
    this._endDrag();

    this._shaker.x = this._pourPoint.x;
    this._shaker.y = this._pourPoint.y;

    this._ingredientsDisplay.x = this._pourPoint.x - 100;
    this._ingredientsDisplay.y = this._pourPoint.y + this._shaker.graphicHeight;

    this._table.y = 870
    this._table.x = -1024
    this._table.tableWidth = 4*1024;

    this._background.x = 1024;
    this._background.y = 512;
    this._shelfs.isBottomVisible = false;

    this._wallItems.x =  this.segmentSize*1.5
    this._wallItems.y =  this.segmentSize*0.4 
  }

  setPortraitMode() {
    this._mode = PORTRAIT;

    this._pourPoint = {
      x: this.segmentSize*0.8, 
      y: 1794
    };

    this._shelfs.x = 200;
    this._shelfs.y = 430;
    this._endDrag();

    this._shaker.x = this._pourPoint.x;
    this._shaker.y = this._pourPoint.y;

    this._ingredientsDisplay.x = this._pourPoint.x - 100;
    this._ingredientsDisplay.y = this._pourPoint.y + this._shaker.graphicHeight;

    this._table.y = 870 + 1024
    this._table.x = -1024
    this._table.tableWidth = 3*1024;
    this._background.y = 1024;
    this._background.x = 512;
    this._shelfs.isBottomVisible = true;

    this._wallItems.x =  this.segmentSize*0.5
    this._wallItems.y =  this.segmentSize*1.4 
  }

  get segmentSize() {
    return 1024;
  }

  sclaleBackground(scale) {
    this._background.scale.set(scale);
  }



}

