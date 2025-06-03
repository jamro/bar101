
const RECIPE_STAGE = "RECIPE_STAGE"
const COMPLETE_STAGE = "COMPLETE_STAGE"

const stages = [
  RECIPE_STAGE,
  COMPLETE_STAGE
]

class Tutorial {
  constructor() {
    this._stageIndex = 0;
    this._enabled = false;
  }

  set enabled(value) {
    this._enabled = value;
  }

  get enabled() {
    return this._enabled;
  }

  get stage() {
    if(!this._enabled) {
      return null;
    }
    return stages[this._stageIndex];
  }

  moveToNextStage() {
    if(!this._enabled) {
      return false;
    }
    const isComplete = this._stageIndex === stages.length - 1;
    if(isComplete) {
      return false;
    }
    this._stageIndex++;
    return true;
  }

  reset() {
    this._stageIndex = 0;
  }

  get isComplete() {
    if(!this._enabled) {
      return false;
    }
    return this._stageIndex === stages.length - 1;
  }
}

export default Tutorial;
export { 
  RECIPE_STAGE,
  COMPLETE_STAGE
};

