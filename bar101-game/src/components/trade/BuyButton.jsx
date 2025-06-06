import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faTimes } from "@fortawesome/free-solid-svg-icons"
import * as styles from './BuyButton.module.css';

export default function BuyButton({
  price,
  available,
  affordable,
  onClick
}) {


  if(!available || !affordable) {
    return (
      <button disabled className={styles.buyButton}>
        <FontAwesomeIcon icon={faTimes} /> 
        <span style={{marginLeft: '1em'}}>{!available ? "Out of Stock" : `$${price.toFixed(2)}`}</span>
      </button>
    )
  }

  return (
    <button onClick={onClick} className={styles.buyButton}>
      <FontAwesomeIcon icon={faBagShopping} /> <span style={{marginLeft: '1em'}}>Buy ${price.toFixed(2)}</span>
    </button>
  )

}

BuyButton.propTypes = {
  price: PropTypes.number.isRequired,
  available: PropTypes.bool,
  affordable: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

BuyButton.defaultProps = {
  available: true,
  affordable: true
};