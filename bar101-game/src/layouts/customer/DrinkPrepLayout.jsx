import React, { useState } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function DrinkPrepLayout({ customer, drinks, onServe }) {

  const buttons = Object.values(drinks).map((drink) => (
    <button className='btn btn-primary m-1' key={drink.id} onClick={() => onServe(drink)}>
      {drink.name}
    </button>
  ));

  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} jobTitle={customer.job_title} trust={customer.trust}>
      {buttons}
    </CustomerPreview>
  </div>
}

DrinkPrepLayout.propTypes = {
  customer: PropTypes.object.isRequired,
  drinks: PropTypes.object.isRequired,
  onServe: PropTypes.func.isRequired,
};