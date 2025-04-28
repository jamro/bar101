import React from 'react';
import * as styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.logo}></div>
    </div>
  );
}