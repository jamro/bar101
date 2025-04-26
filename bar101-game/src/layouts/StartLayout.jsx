import React, { useEffect, useRef } from 'react';
import * as styles from './StartLayout.module.css';

export default function StartLayout({ onStart, onClear }) {

  return <div className={styles.startContainer}>
    <div style={{ textAlign: 'center' }}>
      <button className="btn btn-primary btn-lg" onClick={onStart} ><small>Enter</small> <strong>Bar 101</strong></button>
      <br />
      <small className='text-muted' style={{fontSize: '0.75em'}}>ver.{__BUILD_DATE__}</small>
      <div className="mt-3">
        <button className="btn btn-link btn-sm text-dark" onClick={onClear} ><small>Clear</small> <strong>Local Storage</strong></button>
      </div>
    </div>
  </div>
}