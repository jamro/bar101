import React, { useEffect, useRef } from 'react';
import * as styles from './StartLayout.module.css';

export default function StartLayout({ onStart }) {

  return <div className={styles.startContainer}>
    <button className="btn btn-primary btn-lg" onClick={onStart} ><small>Enter</small> <strong>Bar 101</strong></button>
  </div>

}