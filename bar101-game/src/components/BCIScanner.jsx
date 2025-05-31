import React, { useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import ResizablePixiCanvas from "./ResizablePixiCanvas";
import * as styles from './BCIScanner.module.css';
import BciScannerMasterContainer from "../pixi/bciScanner/BciScannerMasterContainer";

export default function BCIScanner({customer, inventory, onClose}) {

  const masterContainer = BciScannerMasterContainer.getInstance()

  useEffect(() => {
    masterContainer.setData({customer, inventory});
    masterContainer.powerOn();
  }, [customer]);

  useEffect(() => {
    masterContainer.on('close', onClose);
    return () => {
      masterContainer.off('close');
    };
  }, [onClose]);

  return (
    <ResizablePixiCanvas 
        className={styles.bciScannerContainer} 
        masterContainer={masterContainer} 
        cacheKey="BCIScanner" 
        onReady={() => {
          console.log("BCIScanner ready");
        }}
      />
  )
}

BCIScanner.propTypes = {
  customer: PropTypes.object.isRequired,
  inventory: PropTypes.object.isRequired,
  onClose: PropTypes.func
};

BCIScanner.defaultProps = {
  onClose: () => {}
};