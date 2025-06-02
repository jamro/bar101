import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as styles from './StartLayout.module.css';
import { Howl } from 'howler';
import HomeMasterContainer from '../pixi/home/HomeMasterContainer';
import ResizablePixiCanvas from "../components/ResizablePixiCanvas";
import useResizeObserver from "../hooks/useResizeObserver";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faWineGlass, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const clickSound = new Howl({
  src: ['/audio/click.mp3'],
  loop: false,
  volume: 0.3,
});

export default function StartLayout({ onStart, onClear, onStoryTree }) {
  const masterContainer = HomeMasterContainer.getInstance()
  const [debugClicks, setDebugClicks] = useState(0);
  const [containerRef, size] = useResizeObserver();

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
      <button onClick={() => clear()}  className={styles.startButton}>
        <span className={styles.startButtonIcon}><FontAwesomeIcon icon={faTrashCan} /></span>
        <span className={styles.startButtonText}>Clear Data</span>
      </button>
    </div>
  }

  // calculate flex direction based on container size
  let flexDirection, windowWidth, windowHeight;
  if (size.width && size.height) {
    windowWidth = size.width;
    windowHeight = size.height;
  } else {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }
  if (windowWidth > windowHeight * 1.3) {
    flexDirection = "row";
  } else {
    flexDirection = "column";
  }

  return <div className={styles.mainContainer} ref={containerRef}>
      <div className={styles.version} onClick={() => setDebugClicks(debugClicks + 1)}>
        <small>ver.{__BUILD_DATE__}</small>
      </div>
      <div className={styles.flexContainer} style={{flexDirection: flexDirection}}>
        <div className={styles.barImage}>
          <ResizablePixiCanvas 
              masterContainer={masterContainer} 
              className={styles.barImageCanvas} 
              cacheKey="StartLayout" 
            />
        </div>
        <div className={styles.controlsContainer}>
          <div style={{ textAlign: 'center', paddingBottom: '3em' }}>
            <div className={styles.buttonRow}>
              <button onClick={() => start()} className={styles.startButton}>
                <span className={styles.startButtonIcon}><FontAwesomeIcon icon={faWineGlass} /></span>
                <span className={styles.startButtonText}>Enter Bar 101</span>
              </button>
            </div>
            <div className={styles.buttonRow}>
              <button onClick={() => openStoryTree()} className={styles.startButton}>
                <span className={styles.startButtonIcon}><FontAwesomeIcon icon={faMapLocationDot} /></span>
                <span className={styles.startButtonText}>Story Tree</span>
              </button>
            </div>
            {clearSavedDataButton}
          </div>
        </div>
      </div>
    </div>
}

StartLayout.propTypes = {
  onStart: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onStoryTree: PropTypes.func.isRequired
};

StartLayout.defaultProps = {
  onStart: () => {},
  onClear: () => {},
  onStoryTree: () => {}
};

