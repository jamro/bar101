import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DrinkPrompLayout from './customer/DrinkPrompLayout';
import * as styles from './CustomerLayout.module.css';
import DrinkPrepLayout from './customer/DrinkPrepLayout';
import OpenerLayout from './customer/OpenerLayout';
import MainChatLayout from './customer/MainChatLayout';
import DilemmaLayout from './customer/DilemmaLayout';
import GoodbyeLayout from './customer/GoodbyeLayout';

export default function CustomerLayout({ 
  bartender, 
  customers, 
  customerId, 
  drinks, 
  chats, 
  balance,
  tutorialMode,
  onBalanceChange,
  onTrustChange,
  onClose, 
  onExit,
  onDecision,
  onUseItem,
  onBarNoiseVolumeChange
}) {
  
  const [phase, setPhase] = useState("ask_drink");
  const [drink, setDrink] = useState(null);
  const [serveUsual, setServeUsual] = useState(false);

  useEffect(() => {
    console.log("Resetting customer layout for new customerId", customerId);
    setPhase("ask_drink");
    setDrink(null);
  }, [customerId]);

  const serveDrink = (drink) => {
    setDrink(drink);
    setPhase("opener");
    if(drink.special) {
      onUseItem("special");
    }
  }

  const close = () => {
    setPhase("ask_drink");
    setDrink(null);
    onClose();
  }

  const customer = customers[customerId];
  if (!customer) {
    onBarNoiseVolumeChange(0);
    return <div>Customer {customerId} not found</div>;
  }

  const chat = chats[customerId];
  if (!chat) {
    onBarNoiseVolumeChange(0);
    return <div>Chat not found</div>;
  }

  const gotoDrinkServing = (serveUsual) => {
    setPhase("serve_drink")
    setServeUsual(serveUsual);
  }

  let content = null
  if (phase === "ask_drink") {
    onBarNoiseVolumeChange(0.8);
    content = <DrinkPrompLayout 
      bartender={bartender} 
      balance={balance}
      customer={customer} 
      onClose={(serveUsual) => gotoDrinkServing(serveUsual)} 
      onExit={() => onExit()}
    />;
  } else if (phase === "serve_drink") {
    onBarNoiseVolumeChange(1);
    content = <DrinkPrepLayout 
      bartender={bartender}
      customer={customer} 
      balance={balance}
      drinks={drinks} 
      tutorialMode={tutorialMode}
      onServe={(drink) => serveDrink(drink)} 
    />;
  } else if (phase === "opener") {
    onBarNoiseVolumeChange(0.8);
    content = <OpenerLayout 
      bartender={bartender}
      balance={balance}
      customer={customer} 
      allCustomers={customers}
      chat={chat} 
      drink={drink} 
      serveUsual={serveUsual}
      onBalanceChange={(delta) => onBalanceChange(delta)}
      onGoBack={() => gotoDrinkServing(false)} 
      onTrustChange={(dt) => onTrustChange(customer.id, dt)} 
      onClose={(skip) => setPhase(skip ? (chat.decision ? "decision_chat" : "exit") : "main_chat")}
      onExit={() => onExit()}
    />;
  } else if (phase === "main_chat") {
    onBarNoiseVolumeChange(0.8);
    content = <MainChatLayout 
      bartender={bartender} 
      customer={customer} 
      chat={chat} 
      balance={balance}
      drink={drink} 
      onTrustChange={(dt) => onTrustChange(customer.id, dt)} 
      onClose={() => setPhase(chat.decision ? "decision_chat" : "exit")}
      onExit={() => onExit()}
    />;
  } else if (phase === "decision_chat") {
    onBarNoiseVolumeChange(0.8);
    content = <DilemmaLayout 
      customer={customer} 
      bartender={bartender}
      chat={chat} 
      drink={drink} 
      balance={balance}
      onTrustChange={(dt) => onTrustChange(customer.id, dt)} 
      onClose={() => setPhase("exit")}
      onDecision={(d) => onDecision(d)}
      onExit={() => onExit()}
    />;
  } else if (phase === "exit") {
    onBarNoiseVolumeChange(0.8);
    content = <GoodbyeLayout
      bartender={bartender}
      balance={balance}
      customer={customer} 
      drink={drink} 
      onClose={() => close()}
      onExit={() => onExit()}
    />;

  } else {
    content = <div>Error: Unknown phase {phase}</div>;
  }
  
  return content;
}

CustomerLayout.propTypes = {
  bartender: PropTypes.object.isRequired,
  customers: PropTypes.object.isRequired,
  customerId: PropTypes.string.isRequired,
  drinks: PropTypes.object.isRequired,
  chats: PropTypes.object.isRequired,
  balance: PropTypes.number.isRequired,
  tutorialMode: PropTypes.bool,
  onBalanceChange: PropTypes.func.isRequired,
  onTrustChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onExit: PropTypes.func.isRequired,
  onDecision: PropTypes.func.isRequired,
  onUseItem: PropTypes.func.isRequired,
  onBarNoiseVolumeChange: PropTypes.func.isRequired
};

CustomerLayout.defaultProps = {
  tutorialMode: false,
  onBalanceChange: () => {},
  onTrustChange: () => {},
  onClose: () => {},
  onExit: () => {},
  onDecision: () => {},
  onUseItem: () => {},
  onBarNoiseVolumeChange: () => {}
};