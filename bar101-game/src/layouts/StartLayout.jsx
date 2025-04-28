import React, { useEffect, useRef } from 'react';
import * as styles from './StartLayout.module.css';

export default function StartLayout({ onStart, onClear }) {

  return <div className={styles.masterContainer}>
      <div className={styles.version}>
        <small>ver.{__BUILD_DATE__}</small>
      </div>
      <div className={styles.barImage}></div>
      <div className={styles.controlsContainer}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.buttonRow}>
            <button onClick={onStart} >Enter Bar 101</button>
          </div>
          <div className={styles.buttonRow}>
            <button onClick={onClear} >Clear Saved Data</button>
          </div>
        </div>
      </div>
    </div>
}

