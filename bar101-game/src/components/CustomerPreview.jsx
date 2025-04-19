import React from 'react';
import * as styles from './CustomerPreview.module.css';
import PropTypes from 'prop-types';

export default function CustomerPreview({ id, name, trust, drink, children }) {
  return (
    <div className={styles.customerContainer}>
      <div className={styles.customerHeader}>
        <h2>{name}</h2>
        <p>
          <strong>Trust Level:</strong> {10*Math.round(10*trust)}%
          <br/>
          <strong>Drink:</strong> {drink ? drink.glass : 'None'}
          <br/>
          <small><strong>Customer ID:</strong> {id}</small>
        </p>
      </div>
      <div className={styles.customerContent}>
        {children}
      </div>
    </div>
  );
}
CustomerPreview.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  trust: PropTypes.number.isRequired,
  drink: PropTypes.object,
  children: PropTypes.node,
};
CustomerPreview.defaultProps = {
  drink: null,
  children: null,
};