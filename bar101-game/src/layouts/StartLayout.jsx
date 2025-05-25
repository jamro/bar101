import React, { useEffect, useRef } from 'react';
import * as styles from './StartLayout.module.css';
import { Howl } from 'howler';

const clickSound = new Howl({
  src: ['/audio/click.mp3'],
  loop: false,
  volume: 0.3,
});

export default function StartLayout({ onStart, onClear, onStoryTree }) {
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const isMobileDevice = () => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    return (isMobileUserAgent && hasTouch);
  };
  
  const start = () => {
    clickSound.play();
    if (isMobileDevice()) {
      toggleFullscreen();
    }
    onStart();
  }

  const clear = () => {
    clickSound.play();
    onClear();
  }

  const openStoryTree = () => {
    clickSound.play();
    onStoryTree();
  }

  return <div className={styles.masterContainer}>
      <div className={styles.version}>
        <small>ver.{__BUILD_DATE__}</small>
      </div>
      <div className={styles.barImage}></div>
      <div className={styles.controlsContainer}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.buttonRow}>
            <button onClick={() => start()} >Enter Bar 101</button>
          </div>
          <div className={styles.buttonRow}>
            <button onClick={() => openStoryTree()} >Story Tree</button>
          </div>
          <div className={styles.buttonRow}>
            <button onClick={() => clear()} >Clear Saved Data</button>
          </div>
        </div>
      </div>
    </div>
}

