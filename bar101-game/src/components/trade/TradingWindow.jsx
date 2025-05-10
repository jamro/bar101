import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from "framer-motion";
import * as styles from './TradingWindow.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import BuyButton from "./BuyButton";

const userNames = {
  shalek: "Sven Halek",
  dtomenko: "Daria Tomenko",
  rmiskovic: "Rada Miskovic",
  olintz: "Oksana Lintz",
  npetrak: "Nikola Petrak",
  lkova: "Lenart Kova",
}
export default function TradingWindow({ inventory, balance, onBuy, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [storeInventory, setStoreInventory] = useState([]);

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

  const users = ["lkova", "olintz", "rmiskovic", "dtomenko", "npetrak", "shalek"]

  const products = {
    antenna: {
      id: "antenna",
      img: "/img/tv_product_emblem.png",
      name: "Resist TV",
      subtitle: "Satellite Dish",
      price: 50.00,
      available: !inventory.antenna,
      single: true,
      description: "This outlawed dish unlocks Resist TV — the only source of real news beyond the regime's control.",
    },
    scanner: {
      id: "scanner",
      img: "/img/bci_scanner_product_emblem.png",
      name: "BCI Scanner",
      subtitle: "Jailbroken. Off the Grid",
      price: 100.00,
      available: !inventory.scanner,
      single: true,
      description: "This scanner allows you to check your customers' scores and profiles silently.",
    },
    special: {
      id: "special",
      img: "/img/absinthe_product_emblem.png",
      name: "Absinthe",
      subtitle: `Inventory: ${inventory.special}`,
      available: true,
      single: false,
      price: 10.00 + inventory.special * 2,
      description: "A drop of Absinthe in any drink, and your guests will feel unusually at ease.",
    },
    timemachine: {
      id: "timemachine",
      img: "/img/time_machine_product_emblem.png",
      name: "Time Machine",
      subtitle: `Jump to any point in time`,
      available: !inventory.timemachine,
      single: true,
      price: 300.00,
      description: "This banned device enables time travel through the story tree, letting you rewrite its branches as you go."
    },
  }

  for(const user of users) {
    products[user] = {
      id: user,
      img: `/img/${user}_product_emblem.png`,
      name: "BCI User Profile",
      subtitle: userNames[user],
      price: 50.00 + users.indexOf(user) * 30,
      available: !inventory.files.includes(user),
      single: true,
      description: `USB Stick with a BCI user profile of ${userNames[user]}. Portable, untraceable, and illegal.`
    }
  }

  const buy = (itemId, price) => {

    setStoreInventory((prev) => prev.map((product) => {
      if(product.id === itemId && product.single) {
        return {...product, available: false}
      }
      return product
    }))

    onBuy(itemId, price)
  }

  useEffect(() => {
    const initialItems = [];
  
    if(!inventory.antenna) {
      initialItems.push(products.antenna.id)
    } else if (!inventory.scanner) {
      initialItems.push(products.scanner.id)
    } else {
      initialItems.push(products.timemachine.id)
      for(const user of users) {
        if(!inventory.files.includes(user)) {
          initialItems.push(products[user].id)
        }
      }
    }
    initialItems.push(products.special.id)
    setStoreInventory(initialItems)
  }, []);

  const getProductPage = (product) => ({
    id: product.id,
    content: <div className={styles.productContainer}>
      <div className={styles.productHeader}>
        <div className={styles.productImage} style={{backgroundImage: `url(${product.img})`}}></div>
        <div className={styles.productTitle}>
          <h1>{product.name}</h1>
          <small>{product.subtitle}</small>
          <BuyButton 
            onClick={() => buy(product.id, product.price)} 
            price={product.price} 
            affordable={balance >= product.price} 
            available={product.available} 
          />
        </div>
      </div>
      <div className={styles.productBody}>
        {product.description}
      </div>
    </div>
  })
 
  const items = storeInventory.map(id => getProductPage(products[id]))

  if(items.length === 0) {
    return <div className={styles.storeContainer}></div>
  }
  
  return (
    <div className={styles.storeContainer}>
      <div className={styles.storeContentArea}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={items[currentIndex] ? items[currentIndex].id : items[0].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={styles.motionItem}
          >
            {items[currentIndex] ? items[currentIndex].content : items[0].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={handlePrev}
          disabled={items.length === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          onClick={onClose}
        >
          Exit
        </button>
        <button
          onClick={handleNext}
          disabled={items.length === 1}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}

TradingWindow.propTypes = {
  inventory: PropTypes.shape({
    antenna: PropTypes.bool,
    scanner: PropTypes.bool,
    special: PropTypes.number,
    files: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  balance: PropTypes.number.isRequired,
  onBuy: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

TradingWindow.defaultProps = {
  inventory: {
    antenna: false,
    scanner: false,
    special: 0,
    files: []
  },
  balance: 0
};