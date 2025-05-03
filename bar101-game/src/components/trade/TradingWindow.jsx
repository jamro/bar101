import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as styles from './TradingWindow.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import BuyButton from "./BuyButton";

export default function TradingWindow({ inventory, balance, onBuy, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? items.length - 1 : prev - 1
    );
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  const items = [
    { 
      id: 1, 
      content: <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <div className={styles.productImage} style={{backgroundImage: "url(/img/absinthe_product_emblem.png)"}}></div>
          <div className={styles.productTitle}>
            <h1>Absinthe</h1>
            <small>Inventory: {inventory.special}</small>
            <BuyButton onClick={() => onBuy("special", 7.00)} price={7.00} affordable={balance >= 7.00} available={true} />
          </div>
        </div>
        <div className={styles.productBody}>
          A drop of Absinthe in any drink, and your guests will feel unusually at ease.
        </div>
      </div>
    }
  ];

  return (
    <div className={styles.storeContainer}>
      <div className={styles.storeContentArea}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={items[currentIndex].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={styles.motionItem}
          >
            {items[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={handlePrev}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} /> Bye
        </button>
        <button
          onClick={handleNext}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}