import React, { useState, useEffect, use } from 'react';
import NewsLayout from './NewsLayout';
import CustomerLayout from './CustomerLayout';
import TraderLayout from './TraderLayout';
import DateLayout from './DateLayout';

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
  onGameOver,
  onBarNoiseVolumeChange,
}) {
  if(!storyNode) {
    onBarNoiseVolumeChange(0);
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

  const exitNews = () => {
    if(storyNode.visitors.length > 0) {
      onPhaseChange('customer');
    } else {
      onGameOver();
    }
  }

  switch (levelPhase) {
    case 'date':
      onBarNoiseVolumeChange(0);
      return <DateLayout storyNode={storyNode} onClose={() => onPhaseChange('news')} />;
    case 'news':
      onBarNoiseVolumeChange(0);
      return <NewsLayout storyNode={storyNode} inventory={bartender.inventory} onClose={() => exitNews()} />;
    case 'customer':
      onBarNoiseVolumeChange(0.8);
      const customerId = storyNode.visitors[customerIndex];
      if(!customerId) {
        return <div>Error: No customer ID found</div>;
      }
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
        onBarNoiseVolumeChange={onBarNoiseVolumeChange}
      />
    case 'trader':
      onBarNoiseVolumeChange(0.8);
      return <TraderLayout
        bartender={bartender}
        trader={trader}
        balance={balance}
        onClose={() => onLevelComplete()}
        onBuy={(item, price) => onBuy(item, price)}
      />
    default:
      onBarNoiseVolumeChange(0);
      return <div>Error: Unknown phase {levelPhase}</div>;
  }

}

export default GameLayout;