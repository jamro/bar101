import React, { useState } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function DrinkPrepLayout({ bartender, customer, balance, drinks, onServe }) {

  const [special, setSpecial] = useState(false);
  const [quality, setQuality] = useState(0.5);

  const serve = (drink) => {
    onServe({
      ...drink,
      quality,
      special,
    })
  }

  const buttons = Object.values(drinks).map((drink) => (
    <button className='btn btn-primary m-1' key={drink.id} onClick={() => serve(drink)}>
      {drink.name}
    </button>
  ));

  const qualityRadio = [0, 0.25, 0.50, 0.75, 1].map((q) => (
    <div key={q}>
      <input type="radio" id={`quality-${q}`} name="quality" value={q} onChange={() => setQuality(q)} checked={quality === q} />
      <label htmlFor={`quality-${q}`} style={{marginLeft: '1em'}}>{100*q}% Quality</label>
    </div>
  ));

  console.log(quality)

  return <CustomerPreview customer={customer} balance={balance}>
      <div>
        {buttons}
      </div>
      <div style={{padding: '1em'}}>
        <input type="checkbox" id="special" name="special" value="special" onChange={() => setSpecial(!special)} checked={special} disabled={bartender.inventory.special <= 0} />
        <label htmlFor="special" style={{marginLeft: '1em'}}>Add Special Ingredient ({bartender.inventory.special} left)</label>
      </div>
      <div style={{padding: '1em'}}>
        {qualityRadio}
      </div>
    </CustomerPreview>
}

DrinkPrepLayout.propTypes = {
  customer: PropTypes.object.isRequired,
  drinks: PropTypes.object.isRequired,
  onServe: PropTypes.func.isRequired,
};