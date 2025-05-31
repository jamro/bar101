import React, { useEffect, useRef, useState } from 'react';
import * as styles from './StartLayout.module.css';
import { Howl } from 'howler';
import HomeMasterContainer from '../pixi/home/HomeMasterContainer';
import ResizablePixiCanvas from "../components/ResizablePixiCanvas";

const clickSound = new Howl({
  src: ['/audio/click.mp3'],
  loop: false,
  volume: 0.3,
});

let homeMasterContainer; // TODO:re factor to avoid global variable

export default function StartLayout({ onStart, onClear, onStoryTree }) {
  if (!homeMasterContainer) {
    homeMasterContainer = new HomeMasterContainer()
  }
  const homeSceneRef = useRef(homeMasterContainer);
  const [debugClicks, setDebugClicks] = useState(0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
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

  return <div className={styles.mainContainer}>
      <div className={styles.version} onClick={() => setDebugClicks(debugClicks + 1)}>
        <small>ver.{__BUILD_DATE__}</small>
      </div>
      <div className={styles.flexContainer}>
        <div className={styles.barImage}>
          <ResizablePixiCanvas 
              masterContainer={homeSceneRef.current} 
              className={styles.barImageCanvas} 
              cacheKey="StartLayout" 
            />
        </div>
        <div className={styles.controlsContainer}>
          <div style={{ textAlign: 'center', paddingBottom: '3em' }}>
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
    </div>
}

