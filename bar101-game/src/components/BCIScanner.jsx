import React, { useRef, useEffect } from "react";
import ResizablePixiCanvas from "./ResizablePixiCanvas";
import * as styles from './BCIScanner.module.css';
import BciScannerMasterContainer from "../pixi/bciScanner/BciScannerMasterContainer";

let bciScannerMasterContainer; // TODO:re factor to avoid global variable

export default function BCIScanner({customer, inventory, onClose}) {
  if (!bciScannerMasterContainer) {
    bciScannerMasterContainer = new BciScannerMasterContainer()
  }
  const barSceneRef = useRef(bciScannerMasterContainer);

  useEffect(() => {
    barSceneRef.current.setData({customer, inventory});
  }, [customer]);

  useEffect(() => {
    barSceneRef.current.on('close', onClose);
    return () => {
      barSceneRef.current.off('close');
    };
  }, [onClose]);

  return (
    <ResizablePixiCanvas className={styles.bciScannerContainer} masterContainer={barSceneRef.current} />
  )
}