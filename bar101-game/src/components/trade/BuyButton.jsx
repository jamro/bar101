import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faTimes } from "@fortawesome/free-solid-svg-icons"
import * as styles from './BuyButton.module.css';

export default function BuyButton({
  price,
  available=true,
  affordable=true,
  onClick
}) {


  if(!available || !affordable) {
    return (
      <button disabled className={styles.buyButton}>
        <FontAwesomeIcon icon={faTimes} /> 
        <span style={{marginLeft: '1em'}}>{!available ? "Out of Stock" : "Insufficient Funds"}</span>
      </button>
    )
  }

  return (
    <button onClick={onClick} className={styles.buyButton}>
      <FontAwesomeIcon icon={faBagShopping} /> <span style={{marginLeft: '1em'}}>Buy ${price.toFixed(2)}</span>
    </button>
  )

}