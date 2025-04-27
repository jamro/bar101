import React, { useRef, useEffect } from "react";
import * as styles from './CustomerPreview.module.css';
import PropTypes from 'prop-types';
import useResizeObserver from "../hooks/useResizeObserver";
import ResizablePixiCanvas from "./ResizablePixiCanvas";
import BarCustomerMasterContainer from "../pixi/barCustomer/BarCustomerMasterContainer";

export default function CustomerPreview({ customer, drink, children, drinkAnim=false, customerAnim=false }) {
  const [containerRef, size] = useResizeObserver();
  const barSceneRef = useRef(new BarCustomerMasterContainer());

  useEffect(() => {
    barSceneRef.current.setDrink(drink, drinkAnim);
  }, [drink]);

  useEffect(() => {
    barSceneRef.current.setCustomer(customer, customerAnim);
  }, [customer]);

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
      <ResizablePixiCanvas className={styles.previewContainer} masterContainer={barSceneRef.current} />
      <div className={styles.chatContainer}>
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
  children: PropTypes.node,
};
CustomerPreview.defaultProps = {
  drink: null,
  children: null,
};