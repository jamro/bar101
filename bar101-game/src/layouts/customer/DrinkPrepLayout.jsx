import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ResizablePixiCanvas from '../../components/ResizablePixiCanvas';
import CocktailMasterContainer from '../../pixi/cocktail/CocktailMasterContainer';


export default function DrinkPrepLayout({ drinks, bartender, onServe }) {
  const masterContainer = CocktailMasterContainer.getInstance();

  const inventory = bartender.inventory;

  useEffect(() => {
    masterContainer.on('serveDrink', (drink) => {
      onServe(drink);
    })
    return () => {
      masterContainer.off('serveDrink');
    }
  }, []);

  useEffect(() => {
    masterContainer.setDrinks(drinks);
  }, [drinks]);

  useEffect(() => {
    masterContainer.setInventory(inventory);
  }, [inventory]);

  return <ResizablePixiCanvas 
      style={{width: '100%', height: '100%'}} 
      masterContainer={masterContainer} 
      cacheKey="DrinkPrepLayout" 
    />

}

DrinkPrepLayout.propTypes = {
  drinks: PropTypes.object.isRequired,
  bartender: PropTypes.object.isRequired,
  onServe: PropTypes.func
};

DrinkPrepLayout.defaultProps = {
  onServe: () => {}
};
