import React, { useState } from 'react';
import GameLayout from './layouts/GameLayout';  
import LoadingScreen from './layouts/LoadingScreen';
import StartLayout from './layouts/StartLayout';
import useGameState from './hooks/useGameState';
import GameAssets from './pixi/GameAssets';
import StoryTreeLayout from './layouts/StoryTreeLayout';
import HomeMasterContainer from './pixi/home/HomeMasterContainer';

function App({ onBarNoiseVolumeChange }) {
  const [ storyNode, setStoryNode ] = useState(null);
  const [ worldContext , setWorldContext ] = useState(null);
  const [ isStarted, setIsStarted ] = useState(false);
  const [ error , setError ] = useState(null);
  const gameStateObject = useGameState();
  const [ isStoryTree, setIsStoryTree ] = useState(false);
  const { 
    gameState, 
    initAllCustomersTrust, 
    clearGameState, 
    resetStoryPath,
    proceedStoryPath, 
    erodeAllCusomersTrust,
    changeTrust,
    setLevelPhase,
    proceedToNextCustomer,
    setDilemmaDecision,
    changeBalance,
    buyItem,
    useItem,
    openStoryPath,
  } = gameStateObject

  window.debug = {
    ...gameStateObject
  }

  const handleClearGameState = () => {
    clearGameState();
    window.location.reload();
  }

  const jumpToStoryPath = (storyPath) => {
    openStoryPath(storyPath);
    setIsStoryTree(false);
    setIsStarted(true);
  }

  React.useEffect(() => {
    const fetchWorldContext = async () => {
      await GameAssets.loadAssets()

      const response = await fetch('/story/world_context.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} error! ${response.statusText}. Unable to load /story/world_context.json`);
      }
      const data = await response.json();
      setWorldContext(data);
      initAllCustomersTrust(data.bar.customers.reduce((acc, customer) => {
        acc[customer.id] = Math.random()*0.5 - 1;
        return acc;
      }, {}))
    }
    fetchWorldContext();
  }, []);

  React.useEffect(() => {
    const fetchStoryNode = async (nodeFileName) => {
      try {
        const response = await fetch('/story/' + nodeFileName);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} error! ${response.statusText}. Unable to load /story/${nodeFileName}`);
        }
        const data = await response.json();
        console.log("Story node data loaded", data);
        setStoryNode(data);
        window.storyNode = data;
      } catch (error) {
        console.error("Error fetching story node:", error);
        setError(error);
      }
    }
    fetchStoryNode(`node_x${gameState.storyPath.join('')}.json`);

  }, [gameState.storyPath]);

  const gameOver = () => {
    resetStoryPath();
    setIsStarted(false);
  }

  if (error) {
    onBarNoiseVolumeChange(0);
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>There was an error loading the story node.</p>
          <hr />
          <p className="mb-0">
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {error.message}
            </pre>
          </p>
        </div>
      </div>
    );
  }
  
  if (!storyNode || !worldContext) {
    onBarNoiseVolumeChange(0);
    return <LoadingScreen />
  }

  if(!isStarted && !isStoryTree) {
    onBarNoiseVolumeChange(0);
    return <StartLayout 
        onStart={() => setIsStarted(true)} 
        onClear={() => handleClearGameState()} 
        onStoryTree={() => setIsStoryTree(true)}
      />
  }

  if(isStoryTree) {
    onBarNoiseVolumeChange(0);
    return <StoryTreeLayout 
        onClose={() => setIsStoryTree(false)} 
        visitedNodes={gameState.visitedNodes} 
        storyPath={gameState.storyPath} 
        onStoryPathChange={(storyPath) => jumpToStoryPath(storyPath)}
        enableTimeTravel={gameState.inventory.timemachine}
      />
  }

  const customers = worldContext.bar.customers.reduce((acc, customer) => {
    acc[customer.id] = {
      ...customer,
      trust: gameState.customerTrust[customer.id] || 0,
      bci_score: storyNode.character_stats[customer.id]?.bci_score !== undefined ? storyNode.character_stats[customer.id]?.bci_score : customer.bci_score,
      bci_history: storyNode.character_stats[customer.id]?.bci_history || customer.bci_history,
      political_preference: storyNode.character_stats[customer.id]?.political_preference || customer.political_preference,
    };
    return acc;
  }
  , {});

  const bartender = {
    ...worldContext.bar.bartender,
    inventory: gameState.inventory,
  }

  const completeLevel = () => {
    const decisionMaker = Object.keys(storyNode.chats).filter(id => storyNode.chats[id].decision).pop()
    erodeAllCusomersTrust(decisionMaker);
    proceedStoryPath();
  }

  return <GameLayout 
    storyNode={storyNode} 
    bartender={bartender}
    trader={worldContext.bar.trader}
    customers={customers} 
    balance={gameState.balance}
    drinks={worldContext.bar.drinks} 
    chats={storyNode.chats}
    levelPhase={gameState.levelProgress.phase}
    customerIndex={gameState.levelProgress.customerIndex}
    onBalanceChange={(delta) => changeBalance(delta)}
    onPhaseChange={(phase) => setLevelPhase(phase)}
    onCustomerLeave={() => proceedToNextCustomer()}
    onLevelComplete={() => completeLevel()}
    onDecision={(decision) => setDilemmaDecision(decision)}
    onTrustChange={(customerId, dt) => changeTrust(customerId, dt)}
    onBuy={(item, price) => buyItem(item, price)}
    onUseItem={(item) => useItem(item)}
    onGameOver={() => gameOver()}
    onBarNoiseVolumeChange={onBarNoiseVolumeChange}
    onExit={() => setIsStarted(false)}
  />
}
export default App;
