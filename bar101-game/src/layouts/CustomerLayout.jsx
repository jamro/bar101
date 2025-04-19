import React, { useState, useEffect } from 'react';
import DrinkPrompLayout from './customer/DrinkPrompLayout';
import * as styles from './CustomerLayout.module.css';
import DrinkPrepLayout from './customer/DrinkPrepLayout';
import OpenerLayout from './customer/OpenerLayout';
import MainChatLayout from './customer/MainChatLayout';
import DilemmaLayout from './customer/DilemmaLayout';
import GoodbyeLayout from './customer/GoodbyeLayout';

export default function CustomerLayout({ customers, customerId, drinks, chats, onTrustChange, onClose, onDecision }) {
  
  const [phase, setPhase] = useState("ask_drink");
  const [drink, setDrink] = useState(null);

  useEffect(() => {
    console.log("Resetting customer layout for new customerId", customerId);
    setPhase("ask_drink");
    setDrink(null);
  }, [customerId]);

  const serveDrink = (drink) => {
    setDrink(drink);
    setPhase("opener");
  }

  const close = () => {
    setPhase("ask_drink");
    setDrink(null);
    onClose();
  }

  const customer = customers[customerId];
  if (!customer) {
    return <div>Customer not found</div>;
  }

  const chat = chats[customerId];
  if (!chat) {
    return <div>Chat not found</div>;
  }

  let content = null
  if (phase === "ask_drink") {
    content = <DrinkPrompLayout customer={customer} onClose={() => setPhase("serve_drink")} />;
  } else if (phase === "serve_drink") {
    content = <DrinkPrepLayout customer={customer} drinks={drinks} onServe={(drink) => serveDrink(drink)} />;
  } else if (phase === "opener") {
    content = <OpenerLayout 
      customer={customer} 
      allCustomers={customers}
      chat={chat} 
      drink={drink} 
      onGoBack={() => setPhase("serve_drink")} 
      onTrustChange={(dt) => onTrustChange(customer.id, dt)} 
      onClose={(skip) => setPhase(skip ? (chat.decision ? "decision_chat" : "exit") : "main_chat")}
    />;
  } else if (phase === "main_chat") {
    content = <MainChatLayout 
      customer={customer} 
      chat={chat} 
      drink={drink} 
      onTrustChange={(dt) => onTrustChange(customer.id, dt)} 
      onClose={() => setPhase(chat.decision ? "decision_chat" : "exit")}
    />;
  } else if (phase === "decision_chat") {
    content = <DilemmaLayout 
      customer={customer} 
      chat={chat} 
      drink={drink} 
      onTrustChange={(dt) => onTrustChange(customer.id, dt)} 
      onClose={() => setPhase("exit")}
      onDecision={(d) => onDecision(d)}
    />;
  } else if (phase === "exit") {
    content = <GoodbyeLayout
      customer={customer} 
      drink={drink} 
      onClose={() => close()}
    />;

  } else {
    content = <div>Error: Unknown phase {phase}</div>;
  }
  
  return (
    <div className="container">
      {content}
    </div>
  );
}