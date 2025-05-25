import React, { useEffect, useRef, useState } from 'react';
import * as styles from './StartLayout.module.css';
import { Howl } from 'howler';

const clickSound = new Howl({
  src: ['/audio/click.mp3'],
  loop: false,
  volume: 0.3,
});

export default function StartLayout({ onStart, onClear, onStoryTree }) {

  const [debugClicks, setDebugClicks] = useState(0);

  const gameImage = useRef(null);
  
  useEffect(() => {
    let loop = null
    let isActive = true;
    const img = new Image();
    img.src = '/img/bar101_entrence.jpg';
    img.onload = () => {
      // load off image
      img.src = '/img/bar101_entrence_off.jpg';
      img.onload = () => {
        console.log('image loaded');
        if(isActive) {
          loop = setInterval(() => {
            if(!gameImage.current) {
              return;
            }
            if (Math.random() < 0.95) {
              gameImage.current.style.backgroundImage = `url('/img/bar101_entrence.jpg')`;
            } else {
              gameImage.current.style.backgroundImage = `url('/img/bar101_entrence_off.jpg')`;
            }
          }, 30);
        }
      };
    };

    return () => {
      isActive = false;
      if(loop) {
        clearInterval(loop);
      }
    }
  }, []);

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

  let clearSavedDataButton = null;
  if (debugClicks > 10) {
    clearSavedDataButton = <div className={styles.buttonRow}>
      <button onClick={() => clear()} >Clear Saved Data</button>
    </div>
  }

  return <div className={styles.masterContainer}>
      <div className={styles.version} onClick={() => setDebugClicks(debugClicks + 1)}>
        <small>ver.{__BUILD_DATE__}</small>
      </div>
      <div ref={gameImage} className={styles.barImage} style={{ backgroundImage: `url('/img/bar101_entrence.jpg')` }}></div>
      <div className={styles.controlsContainer}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.buttonRow}>
            <button onClick={() => start()} >Enter Bar 101</button>
          </div>
          <div className={styles.buttonRow}>
            <button onClick={() => openStoryTree()} >Story Tree</button>
          </div>
          {clearSavedDataButton}
        </div>
      </div>
    </div>
}

