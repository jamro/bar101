import React, { useState, useEffect, use } from 'react';
import NewsLayout from './NewsLayout';
import CustomerLayout from './CustomerLayout';
import TraderLayout from './TraderLayout';

function GameLayout({
  storyNode, 
  bartender, 
  trader,
  customers, 
  balance,
  drinks, 
  chats, 
  levelPhase,
  customerIndex,
  onCustomerLeave,
  onPhaseChange,
  onTrustChange, 
  onLevelComplete,
  onDecision,
  onBalanceChange,
  onUseItem,
  onBuy,
}) {
  if(!storyNode) {
    return <div>Loading...</div>;
  }

  const handleCustomerLeave = () => {
    if (customerIndex === storyNode.visitors.length - 1) { // last customer
      console.log("Last customer left, moving to trader");
      onPhaseChange('trader')
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
      return <NewsLayout data={storyNode.news} inventory={bartender.inventory} onClose={() => onPhaseChange('customer')} />;
    case 'customer':
      return <CustomerLayout 
        customers={customers} 
        bartender={bartender}
        customerId={customerId} 
        balance={balance}
        onBalanceChange={(delta) => onBalanceChange(delta)}
        chats={chats} 
        drinks={drinks} 
        onTrustChange={(customerId, dt) => onTrustChange(customerId, dt)} 
        onClose={() => handleCustomerLeave()}
        onDecision={(decision) => onDecision(decision)}
        onUseItem={(item) => onUseItem(item)}
      />
    case 'trader':
      return <TraderLayout
        bartender={bartender}
        trader={trader}
        balance={balance}
        onClose={() => onLevelComplete()}
        onBuy={(item, price) => onBuy(item, price)}
      />
    default:
      return <div>Error: Unknown phase {levelPhase}</div>;
  }

}

export default GameLayout;