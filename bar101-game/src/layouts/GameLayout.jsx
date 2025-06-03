import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
import NewsLayout from './NewsLayout';
import CustomerLayout from './CustomerLayout';
import TraderLayout from './TraderLayout';
import DateLayout from './DateLayout';

function GameLayout({
  storyPath,
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
  onExit,
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

  let tutorialMode = storyPath.length === 0 && customerIndex === 0;

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
        tutorialMode={tutorialMode}
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
        onExit={() => onExit()}
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

GameLayout.propTypes = {
  storyPath: PropTypes.string.isRequired,
  storyNode: PropTypes.object.isRequired,
  bartender: PropTypes.object.isRequired,
  trader: PropTypes.object.isRequired,
  customers: PropTypes.object.isRequired,
  balance: PropTypes.number.isRequired,
  drinks: PropTypes.object.isRequired,
  chats: PropTypes.object.isRequired,
  levelPhase: PropTypes.string.isRequired,
  customerIndex: PropTypes.number.isRequired,
  onCustomerLeave: PropTypes.func.isRequired,
  onPhaseChange: PropTypes.func.isRequired,
  onTrustChange: PropTypes.func.isRequired,
  onLevelComplete: PropTypes.func.isRequired,
  onDecision: PropTypes.func.isRequired,
  onBalanceChange: PropTypes.func.isRequired,
  onUseItem: PropTypes.func.isRequired,
  onBuy: PropTypes.func.isRequired,
  onGameOver: PropTypes.func.isRequired,
  onBarNoiseVolumeChange: PropTypes.func.isRequired,
  onExit: PropTypes.func.isRequired
};

GameLayout.defaultProps = {
  onCustomerLeave: () => {},
  onPhaseChange: () => {},
  onTrustChange: () => {},
  onLevelComplete: () => {},
  onDecision: () => {},
  onBalanceChange: () => {},
  onUseItem: () => {},
  onBuy: () => {},
  onGameOver: () => {},
  onBarNoiseVolumeChange: () => {},
  onExit: () => {}
};