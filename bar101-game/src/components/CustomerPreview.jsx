import React, { useRef, useEffect, useState } from "react";
import * as styles from './CustomerPreview.module.css';
import PropTypes from 'prop-types';
import useResizeObserver from "../hooks/useResizeObserver";
import ResizablePixiCanvas from "./ResizablePixiCanvas";
import BarCustomerMasterContainer from "../pixi/barCustomer/BarCustomerMasterContainer";
import BCIScanner from "./BCIScanner";


export default function CustomerPreview({ customer,bartender, drink, children, drinkAnim=false, customerAnim=false, balance=0, onExit=()=>{} }) {
  const masterContainer = BarCustomerMasterContainer.getInstance();
  const [containerRef, size] = useResizeObserver();
  const [bciShown, setBciShown] = useState(false);

  useEffect(() => {
    masterContainer.setDrink(drink, drinkAnim);
  }, [drink]);

  useEffect(() => {
    masterContainer.setCustomer(customer, customerAnim);
  }, [customer]);

  useEffect(() => {
    masterContainer.setBciAvailable(bartender.inventory.scanner);
  }, [bartender]);

  useEffect(() => {
    masterContainer.setBalance(balance);
  }, [balance]);
  
  useEffect(() => {
    masterContainer.on('bciToggle', () => {
      setBciShown((prev) => !prev);
    });
    masterContainer.on('exit', () => {
      onExit();
    });
    return () => {
      masterContainer.off('bciToggle');
    };
  }, []);

  // estimate size when not available yet due to ref not being set
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

  return (
    <div className={styles.mainContainer} ref={containerRef} style={{flexDirection: flexDirection}}>
      <ResizablePixiCanvas 
        className={styles.previewContainer} 
        masterContainer={masterContainer} 
        cacheKey="CustomerPreview" 
        onReady={() => {
          console.log("CustomerPreview ready");
        }}
      />
      <div className={styles.chatContainer}>
        {bciShown && <BCIScanner customer={customer} inventory={bartender.inventory} onClose={() => setBciShown(false)}/>}
        {children}
      </div>
    </div>
  );
}
CustomerPreview.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    jobTitle: PropTypes.string.isRequired,
    trust: PropTypes.number.isRequired,
    bciScore: PropTypes.number.isRequired,
    politicalPreference: PropTypes.string.isRequired,
  }).isRequired,
  drink: PropTypes.object,
  drinkAnim: PropTypes.bool,
  customerAnim: PropTypes.bool,
  balance: PropTypes.number,
  children: PropTypes.node,
};
CustomerPreview.defaultProps = {
  drink: null,
  children: null,
};