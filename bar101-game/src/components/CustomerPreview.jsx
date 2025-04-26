import React from 'react';
import * as styles from './CustomerPreview.module.css';
import PropTypes from 'prop-types';

export default function CustomerPreview({ customer, drink, children }) {
  const { 
    id, 
    name, 
    job_title: jobTitle, 
    trust, 
    bci_score: bciScore, 
    political_preference: politicalPreference 
  } = customer;

  return (
    <div className={styles.customerContainer}>
      <div className={styles.customerHeader}>
        <h2 className='mb-0'>{name}</h2>
        <p>
          {jobTitle}
          <br/>
          <strong>BCI Score:</strong> {Math.round(bciScore)}%
          <br/>
          <strong>Political Preference:</strong> {politicalPreference}
          <br/>
          <strong>Trust Level:</strong> {Math.round(100*trust)}%
          <br/>
          <strong>Drink:</strong> {drink ? drink.glass : 'None'}
        </p>
      </div>
      <div className={styles.customerContent}>
        {children}
      </div>
    </div>
  );
}
CustomerPreview.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    jobTitle: PropTypes.string.isRequired,
    trust: PropTypes.number.isRequired,
    bciScore: PropTypes.number.isRequired,
    politicalPreference: PropTypes.string.isRequired,
  }).isRequired,
  drink: PropTypes.object,
  children: PropTypes.node,
};
CustomerPreview.defaultProps = {
  drink: null,
  children: null,
};