import * as PIXI from 'pixi.js';
import Bottle from './Bottle';
import Shaker from './Shaker';
import Liquid from './Liquid';
import IngredientsDisplay from './IngredientsDisplay';

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
    this._currentDrinkIngredients = {}
    this._shakerContent = 0;
    this._drinks = drinks;
    this._ingredients = getIngredients(drinks);
    this._mode = LANDSCAPE;

    // bakchround
    this._background = new PIXI.Graphics();
    this.addChild(this._background);

    // ingridients display
    this._ingredientsDisplay = new IngredientsDisplay();
    this.addChild(this._ingredientsDisplay);

    // liquid particles
    this._liquid = new Liquid();
    this.addChild(this._liquid);

    // bottles
    this._bottleContainer = new PIXI.Container();
    this.addChild(this._bottleContainer);
    this._bottles = this._ingredients.map((ingredient, index) => {
      const bottle = new Bottle(ingredient.id);
      bottle.x = (index % 4) * 120;
      bottle.y = index < 4 ? 0 : 450;
      bottle.initX = bottle.x;
      bottle.initY = bottle.y;
      this._bottleContainer.addChild(bottle);

      this._dragTarget = null;
      bottle.on('pointerdown', (event) => this._startDrag(event));
      bottle.on('pointerup', (event) => this._endDrag(event));
      bottle.on('pointerupoutside', (event) => this._endDrag(event));
      return bottle;
    })

    // drag event hadling
    this.interactive = true;
    this.on('pointermove', this._onDragMove);
    this._dragPointer = {x: 0, y: 0};
    this._pourPoint = {x: 0, y: 0};

    // shaker
    this._shaker = new Shaker();
    this.addChild(this._shaker);
    this._shaker.on('pointerdown', (event) => this._startShaking(event));
    this._shaker.on('pointerup', (event) => this._endShaking(event));
    this._shaker.on('pointerupoutside', (event) => this._endShaking(event));

    // rendering / update
    let loop
    this.on('added', () => {
      loop = setInterval(() => this._update(), 1000/60);
    })
    this.on('removed', () => {
      clearInterval(loop)
    })

    // init positioning
    this.setLandscapeMode()
  }

  _pour(ingredientId, amount) {
    if(this._shakerContent > SHAKER_CAPACITY) {
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
    setTimeout(() => {
      const match = this._matchDrink();
      if (!match) {
        this.emit('serveDrink', {
          id: "unknown",
          quality: 0,
          special: false,
          glass: Math.random() > 0.5 ? "rocks" : "coupe",
        });
        return
      }

      const quality = this._calcDrinkQuality(match);

      this.emit('serveDrink', {
        ...match,
        quality,
        special: false,
      });
      return

    }, 1000)

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
    if (this._dragTarget) {
      this._dragTarget.tipX = this._dragPointer.x - this._bottleContainer.x;
      this._dragTarget.y = this._dragPointer.y - this._bottleContainer.y + this._dragTarget.yShift;
      this._liquid.cutOffY = this._shaker.y;
      
      const pourDistanceX = this._pourPoint.x - this._bottleContainer.x - this._dragTarget.tipX
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
    
      if (Math.abs(pourDistanceX) > this._shaker.bottleneckWidth/2 || this._shakerContent > SHAKER_CAPACITY) {
        this._liquid.amount = 0;
      } else {
        this._liquid.amount = Math.max(0, (this._dragTarget.rotation - 0.5*Math.PI)/(0.5*Math.PI))
        targetBottleRotation = Math.max(targetBottleRotation, maxRotation)
      }

      this._dragTarget.rotation += (targetBottleRotation - this._dragTarget.rotation) * (this._dragTarget.rotation < Math.PI/2 ? 0.03 : 0.01)

      this._dragTarget.y -= (this._dragTarget.rotation/Math.PI)*this._dragTarget.yShift + 0.5*(1-endRotationAmount)*this._dragTarget.yShift

      const pourPintLimit = this._pourPoint.y - this._bottleContainer.y - 50 + Math.abs(pourDistanceX)
      this._dragTarget.tipY = Math.min(this._dragTarget.tipY, pourPintLimit);

      this._liquid.source.x = this._dragTarget.tipX + this._bottleContainer.x
      this._liquid.source.y = this._dragTarget.tipY + this._bottleContainer.y
    } else {
      this._liquid.amount = 0;
    }
    for (let i = 0; i < this._bottles.length; i++) {
      const bottle = this._bottles[i];
      if (this._dragTarget !== bottle) {
        bottle.x += (bottle.initX - bottle.x) * 0.1;
        bottle.y += (bottle.initY - bottle.y) * 0.1;
        bottle.rotation += (0 - bottle.rotation) * 0.1;
      }
    }

    this._liquid.update();
    if(this._liquid.amount > 0 && this._dragTarget) {
      this._pour(this._dragTarget.id, this._liquid.amount/4);
      this._ingredientsDisplay.update(this._currentDrinkIngredients);
    }

    if (this._shaker.shaking) {
      this._ingredientsDisplay.alpha += (0 - this._ingredientsDisplay.alpha) * 0.1;
      this._shaker.updateShaking(
        this._dragPointer.x,
        this._dragPointer.y - this._shaker.graphicHeight/2
      );
      if (this._shaker.progress >= 1) {
        this._endShaking();
      }
    } else {
      this._ingredientsDisplay.alpha += (1 - this._ingredientsDisplay.alpha) * 0.1;
      this._shaker.postShaking();
    }
  }
  
  setLandscapeMode() {
    this._mode = LANDSCAPE;
    this._background.clear();
    this._background
      .rect(0, 0, 2*this.segmentSize, this.segmentSize)
      .fill(0x333333)
  
    this._pourPoint = {
      x: this.segmentSize*1.75, 
      y: this.segmentSize*0.8
    };

    this._bottleContainer.x = 300;
    this._bottleContainer.y = 500;
    this._endDrag();

    this._shaker.x = this._pourPoint.x;
    this._shaker.y = this._pourPoint.y;

    this._ingredientsDisplay.x = this._pourPoint.x - 100;
    this._ingredientsDisplay.y = this._pourPoint.y + this._shaker.graphicHeight;
  }
  setPortraitMode() {
    this._mode = PORTRAIT;
    this._background.clear();
    this._background
      .rect(0, 0, this.segmentSize, 2*this.segmentSize)
      .fill(0x333333)

    this._pourPoint = {
      x: this.segmentSize*0.8, 
      y: this.segmentSize*1.75
    };

    this._bottleContainer.x = 300;
    this._bottleContainer.y = 500;
    this._endDrag();

    this._shaker.x = this._pourPoint.x;
    this._shaker.y = this._pourPoint.y;

    this._ingredientsDisplay.x = this._pourPoint.x - 100;
    this._ingredientsDisplay.y = this._pourPoint.y + this._shaker.graphicHeight;
  }

  get segmentSize() {
    return 1024;
  }



}

