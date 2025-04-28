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
  customerIndex,
  onCustomerLeave,
  onPhaseChange,
  onTrustChange, 
  onLevelComplete,
  onDecision,
}) {
  if(!storyNode) {
    return <div>Loading...</div>;
  }

  const handleCustomerLeave = () => {
    if (customerIndex === storyNode.visitors.length - 1) { // last customer
      console.log("Last customer left, showing news");
      onLevelComplete();
    } else {
      console.log("Customer left, moving to next customer");
      onCustomerLeave()
    }
  }

  const customerId = storyNode.visitors[customerIndex];

  if(!customerId) {
    return <div>Error: No customer ID found</div>;
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
        onClose={() => handleCustomerLeave()}
        onDecision={(decision) => onDecision(decision)}
      />
    default:
      return <div>Error: Unknown phase {levelPhase}</div>;
  }

}

export default GameLayout;