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
      transition: { duration: 0.2 },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  const items = [
    {
      id: 1,
      content: <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <div className={styles.productImage} style={{backgroundImage: "url(/img/tv_product_emblem.png)"}}></div>
          <div className={styles.productTitle}>
            <h1>Resist TV</h1>
            <small>Satellite Dish</small>
            <BuyButton onClick={() => onBuy("antenna", 50.00)} price={50.00} affordable={balance >= 50.00} available={!inventory.antenna} />
          </div>
        </div>
        <div className={styles.productBody}>
          This outlawed dish unlocks Resist TV — the only source of real news beyond the regime's control.
        </div>
      </div>
    },
    {
      id: 2,
      content: <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <div className={styles.productImage} style={{backgroundImage: "url(/img/bci_scanner_product_emblem.png)"}}></div>
          <div className={styles.productTitle}>
            <h1>BCI Scanner</h1>
            <small>Jailbroken. Off the Grid.</small>
            <BuyButton onClick={() => onBuy("scanner", 200.00)} price={200.00} affordable={balance >= 200.00} available={!inventory.scanner} />
          </div>
        </div>
        <div className={styles.productBody}>
          Black market BCI scanner to silently check your customers' scores and profiles.
        </div>
      </div>
    },
    { 
      id: 3, 
      content: <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <div className={styles.productImage} style={{backgroundImage: "url(/img/absinthe_product_emblem.png)"}}></div>
          <div className={styles.productTitle}>
            <h1>Absinthe</h1>
            <small>Inventory: {inventory.special}</small>
            <BuyButton onClick={() => onBuy("special", 7.00 + inventory.special *2)} price={7.00 + inventory.special *2} affordable={balance >= 7.00 + inventory.special *2} available={true} />
          </div>
        </div>
        <div className={styles.productBody}>
          A drop of Absinthe in any drink, and your guests will feel unusually at ease.
        </div>
      </div>
    },
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