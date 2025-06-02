import { PURCHASABLE_ITEMS, USABLE_ITEMS } from './constants';

export const useInventory = (state, setState) => {
  const buyItem = (item, price) => {
    if (!PURCHASABLE_ITEMS.includes(item)) {
      throw new Error(`Unknown item to buy: ${item}`);
    }

    switch (item) {
      case "special":
        setState((prevState) => ({
          ...prevState,
          inventory: {
            ...prevState.inventory,
            special: prevState.inventory.special + 1
          },
          balance: prevState.balance - price
        }));
        break;
      case "antenna":
        setState((prevState) => ({
          ...prevState,
          inventory: {
            ...prevState.inventory,
            antenna: true
          },
          balance: prevState.balance - price
        }));
        break;
      case "scanner":
        setState((prevState) => ({
          ...prevState,
          inventory: {
            ...prevState.inventory,
            scanner: true
          },
          balance: prevState.balance - price
        }));
        break;
      case "timemachine":
        setState((prevState) => ({
          ...prevState,
          inventory: {
            ...prevState.inventory,
            timemachine: true
          },
          balance: prevState.balance - price
        }));
        break;
      case "lkova":
      case "olintz":
      case "rmiskovic":
      case "dtomenko":
      case "npetrak":
      case "shalek":
        setState((prevState) => ({
          ...prevState,
          inventory: {
            ...prevState.inventory,
            files: [...prevState.inventory.files, item].filter((value, index, self) => self.indexOf(value) === index)
          },
          balance: prevState.balance - price
        }));
        break;
      default:
        throw new Error(`Unknown item to buy: ${item}`);
    }
  };

  const useItem = (item) => {
    if (!USABLE_ITEMS.includes(item)) {
      throw new Error(`Unknown item to use: ${item}`);
    }

    console.log(`Using item:`, item);
    switch (item) {
      case "special":
        setState((prevState) => ({
          ...prevState,
          inventory: {
            ...prevState.inventory,
            special: Math.max(prevState.inventory.special - 1, 0)
          }
        }));
        break;
      default:
        throw new Error(`Unknown item to use: ${item}`);
    }
  };

  return {
    buyItem,
    useItem
  };
}; 