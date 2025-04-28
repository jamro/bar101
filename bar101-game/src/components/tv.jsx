import React, {useRef, useEffect} from 'react';
import * as styles from './tv.module.css';
import ResizablePixiCanvas from "./ResizablePixiCanvas";
import NewsMasterContainer from "../pixi/news/NewsMasterContainer";

export default function TV({
  mode = "official",
  pipUrl = null,
  headline = "Breaking News",
  onReady = () => {},
}) {

  const barSceneRef = useRef(new NewsMasterContainer());

  useEffect(() => {
    if(mode === "official") {
      barSceneRef.current.setOfficialMode();
    } else {
      barSceneRef.current.setUndergroundMode();
    }
    barSceneRef.current.setPip(pipUrl);
    barSceneRef.current.setHeadline(headline);
  }, [mode, pipUrl, headline]);

  return <ResizablePixiCanvas masterContainer={barSceneRef.current} className={styles.container} onReady={onReady}/>

}