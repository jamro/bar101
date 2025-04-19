import React, { useState } from 'react';
import GameLayout from './layouts/GameLayout';  
import LoadingScreen from './layouts/LoadingScreen';
import StartLayout from './layouts/StartLayout';

function App() {
  const [ storyNode, setStoryNode ] = useState(null);
  const [ customers, setCustomers ] = useState({});
  const [ drinks, setDrinks ] = useState({});
  const [ chats, setChats ] = useState({});
  const [ storyPath, setStoryPath ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ isStarted, setIsStarted ] = useState(false);

  React.useEffect(() => {
    const fetchStoryNode = async (nodeFileName) => {
      setLoading(true);
      const response = await fetch('/story/' + nodeFileName);
      const data = await response.json();
      console.log("Story node data loaded", data);
      setStoryNode(data);
      setChats(data.chats);
    }
    const fetchWorldContext = async () => {
      const response = await fetch('/story/world_context.json');
      const data = await response.json();
      setCustomers(data.bar.customers.reduce((acc, customer) => {
        acc[customer.id] = {
          ...customer,
          trust: Math.random() - 0.5,
        };
        return acc;
      }, {}))
      setDrinks(data.bar.drinks);
      setLoading(false);
    }
    fetchStoryNode(`node_x${storyPath.join('')}.json`);
    fetchWorldContext();

  }, []);

  React.useEffect(() => {
    const fetchStoryNode = async (nodeFileName) => {
      setLoading(true);
      const response = await fetch('/story/' + nodeFileName);
      const data = await response.json();
      console.log("Story node data loaded", data);
      setStoryNode(data);
      setChats(data.chats);
      setLoading(false);
    }
    fetchStoryNode(`node_x${storyPath.join('')}.json`);

  }, [storyPath]);

  const updateTrust = (customerId, dt) => {
    setCustomers((prevCustomers) => ({
      ...prevCustomers,
      [customerId]: {
        ...prevCustomers[customerId],
        trust: Math.min(Math.max(prevCustomers[customerId].trust + dt, -1), 1),
      },
    }));
  }
  
  if (loading) {
    return <LoadingScreen />
  }

  if(!isStarted) {
    return <StartLayout onStart={() => setIsStarted(true)} />
  }

  return <GameLayout 
    storyNode={storyNode} 
    customers={customers} 
    drinks={drinks} 
    chats={chats}
    onLevelComplete={(decision) => setStoryPath((prev) => [...prev, decision])}
    onTrustChange={(customerId, dt) => updateTrust(customerId, dt)}
  />
}
export default App;
