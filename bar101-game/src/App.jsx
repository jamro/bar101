import React, { useState } from 'react';
import GameLayout from './layouts/GameLayout';  
import LoadingScreen from './layouts/LoadingScreen';
import StartLayout from './layouts/StartLayout';

function App({initStoryPath=[], onStoryPathChange = () => {}}) {
  const [ storyNode, setStoryNode ] = useState(null);
  const [ customers, setCustomers ] = useState({});
  const [ drinks, setDrinks ] = useState({});
  const [ bartender, setBartender ] = useState(null);
  const [ chats, setChats ] = useState({});
  const [ storyPath, setStoryPath ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ isStarted, setIsStarted ] = useState(false);
  const [ error , setError ] = useState(null);

  React.useEffect(() => {
    const fetchWorldContext = async () => {
      const response = await fetch('/story/world_context.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} error! ${response.statusText}. Unable to load /story/world_context.json`);
      }
      const data = await response.json();
      setCustomers(data.bar.customers.reduce((acc, customer) => {
        acc[customer.id] = {
          ...customer,
          trust: Math.random() - 0.5,
        };
        return acc;
      }, {}))
      setDrinks(data.bar.drinks);
      setBartender(data.bar.bartender);
      setLoading(false);
    }
    fetchWorldContext();
    setStoryPath(initStoryPath);
  }, []);

  React.useEffect(() => {
    if (!storyPath) return;
    const fetchStoryNode = async (nodeFileName) => {
      setLoading(true);
      try {
        const response = await fetch('/story/' + nodeFileName);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} error! ${response.statusText}. Unable to load /story/${nodeFileName}`);
        }
        const data = await response.json();
        console.log("Story node data loaded", data);
        setStoryNode(data);
        setChats(data.chats);
        setCustomers((prevCustomers) => Object.values(prevCustomers).reduce((acc, customer) => {
          acc[customer.id] = {
            ...customer,
            bci_score: data.character_stats[customer.id]?.bci_score || customer.bci_score,
            political_preference: data.character_stats[customer.id]?.political_preference || customer.political_preference,
          };
          return acc;
        }
        , {}));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching story node:", error);
        setError(error);
        setLoading(false);
      }
    }
    fetchStoryNode(`node_x${storyPath.join('')}.json`);
    onStoryPathChange(storyPath);

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

  if (error) {
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
  
  if (loading) {
    return <LoadingScreen />
  }

  if(!isStarted) {
    return <StartLayout onStart={() => setIsStarted(true)} />
  }

  return <GameLayout 
    storyNode={storyNode} 
    bartender={bartender}
    customers={customers} 
    drinks={drinks} 
    chats={chats}
    onLevelComplete={(decision) => setStoryPath((prev) => [...prev, decision])}
    onTrustChange={(customerId, dt) => updateTrust(customerId, dt)}
  />
}
export default App;
