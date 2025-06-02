import React from 'react';
import PropTypes from 'prop-types';
import * as styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.logo}></div>
    </div>
  );
}

LoadingScreen.propTypes = {};

LoadingScreen.defaultProps = {};