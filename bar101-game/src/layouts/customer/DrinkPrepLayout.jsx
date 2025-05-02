import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ResizablePixiCanvas from '../../components/ResizablePixiCanvas';
import CocktailMasterContainer from '../../pixi/cocktail/CocktailMasterContainer';

let cocktailMasterContainer; // TODO:re factor to avoid global variable

export default function DrinkPrepLayout({ drinks, bartender, onServe }) {
  if (!cocktailMasterContainer) {
    cocktailMasterContainer = new CocktailMasterContainer();
  }
  const cocktailSceneRef = useRef(cocktailMasterContainer);

  const inventory = bartender.inventory;

  useEffect(() => {
    cocktailMasterContainer.on('serveDrink', (drink) => {
      onServe(drink);
    })
    return () => {
      cocktailMasterContainer.off('serveDrink');
    }
  }, []);

  useEffect(() => {
    cocktailMasterContainer.setDrinks(drinks);
  }, [drinks]);

  useEffect(() => {
    cocktailMasterContainer.setInventory(inventory);
  }, [inventory]);

  return <ResizablePixiCanvas style={{width: '100%', height: '100%'}} masterContainer={cocktailSceneRef.current} />

}

DrinkPrepLayout.propTypes = {
  drinks: PropTypes.object.isRequired,
  onServe: PropTypes.func,
};


DrinkPrepLayout.defaultProps = {
  customer: {},
  drinks: {},
  onServe: () => {},
  bartender: {},
};
