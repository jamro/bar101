import React, {useRef, useEffect, forwardRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import * as styles from './TV.module.css';
import ResizablePixiCanvas from "./ResizablePixiCanvas";
import NewsMasterContainer from "../pixi/news/NewsMasterContainer";

const TV = forwardRef(({
  mode,
  pipUrl,
  headline,
  onReady,
}, ref) => {

  const masterContainer = NewsMasterContainer.getInstance();

  useEffect(() => {
    if(mode === "official") {
      masterContainer.setOfficialMode();
    } else {
      masterContainer.setUndergroundMode();
    }
    masterContainer.setPip(pipUrl);
    masterContainer.setHeadline(headline);
  }, [mode, pipUrl, headline]);

  useImperativeHandle(ref, () => ({
    fadeIn: () => masterContainer.fadeIn(),
    fadeOut: () => masterContainer.fadeOut(),
    playIntro: () => masterContainer.playIntro(),
    hideIntro: () => masterContainer.hideIntro(),
  }));

  return <ResizablePixiCanvas 
      masterContainer={masterContainer} 
      className={styles.container} 
      onReady={onReady} 
      cacheKey="TV" 
    />

})

TV.propTypes = {
  mode: PropTypes.oneOf(['official', 'underground']),
  pipUrl: PropTypes.string.isRequired,
  headline: PropTypes.string,
  onReady: PropTypes.func
};

TV.defaultProps = {
  mode: 'official',
  headline: 'Breaking News',
  onReady: () => {}
};

export default TV;