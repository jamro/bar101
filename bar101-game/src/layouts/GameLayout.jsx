import React, { useState, useEffect, use } from 'react';
import NewsLayout from './NewsLayout';
import CustomerLayout from './CustomerLayout';

function GameLayout({
  storyNode, 
  bartender, 
  customers, 
  drinks, 
  chats, 
  levelPhase,
  onPhaseChange,
  onTrustChange, 
  onLevelComplete
}) {
  if(!storyNode) {
    return <div>Loading...</div>;
  }
  const [customerId, setCustomerId] = useState(null);
  const [customerIndex, setCustomerIndex] = useState(0);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    console.log("Initializing game layout");
    const visitor = storyNode.visitors[0];
    setCustomerId(visitor);
    setDecision(null);
  }, [storyNode]);

  const onCustomerLeave = () => {
    console.log("Customer left");
    setCustomerIndex(prev => prev + 1);
  }

  useEffect(() => {
    if (customerIndex < storyNode.visitors.length) {
      setCustomerId(storyNode.visitors[customerIndex]);
      console.log("Customer index changed to: ", customerIndex, ", customerId:", storyNode.visitors[customerIndex]);
    } else {
      console.log("All customers have left, showing news");
      onPhaseChange('news');
      setCustomerId(null);
      onLevelComplete(decision);
      setDecision(null);
    }
  }, [customerIndex]);

  if(customerId === null) {
    return <div>Loading...</div>;
  }

  switch (levelPhase) {
    case 'news':
      return <NewsLayout data={storyNode.news} onClose={() => onPhaseChange('customer')} />;
    case 'customer':
      return <CustomerLayout 
        customers={customers} 
        bartender={bartender}
        customerId={customerId} 
        chats={chats} 
        drinks={drinks} 
        onTrustChange={(customerId, dt) => onTrustChange(customerId, dt)} 
        onClose={() => onCustomerLeave()}
        onDecision={(decision) => setDecision(decision)}
      />
    default:
      return <div>Error: Unknown phase {levelPhase}</div>;
  }

}

export default GameLayout;