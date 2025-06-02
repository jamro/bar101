export const useStoryPath = (state, setState, updateTimestamp) => {
  const proceedStoryPath = () => {
    setState((prevState) => {
      if (!prevState.levelProgress.decision) {
        throw new Error("No decision made yet.");
      }
      console.log(`[useStoryPath] Proceeding story path. Decision: ${prevState.levelProgress.decision}, Story path: ${prevState.storyPath.join('-')}`);
      return {
        ...prevState,
        timestamp: updateTimestamp(),
        storyPath: [...prevState.storyPath, prevState.levelProgress.decision],
        visitedNodes: [...prevState.visitedNodes, "x" + [...prevState.storyPath, prevState.levelProgress.decision].join('')].filter((value, index, self) => self.indexOf(value) === index),
        levelProgress: {
          ...prevState.levelProgress,
          customerIndex: 0,
          phase: 'date',
          decision: null
        }
      };
    });
  };

  const visitNode = (nodeId) => {
    if (!nodeId.startsWith("x")) {
      throw new Error(`Invalid nodeId: ${nodeId}`);
    }
    if (nodeId.length > 8) {
      throw new Error(`Invalid nodeId: ${nodeId}`);
    }
    const nodesChain = [];
    for (let i = 0; i < nodeId.length; i++) {
      nodesChain.push(nodeId.slice(0, i + 1));
    }
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      visitedNodes: [...prevState.visitedNodes, ...nodesChain].filter((value, index, self) => self.indexOf(value) === index),
    }));
  };

  const resetStoryPath = () => {
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      storyPath: [],
      levelProgress: {
        ...prevState.levelProgress,
        phase: 'date',
        customerIndex: 0,
        decision: null,
      },
    }));
  };

  const openStoryPath = (storyPath) => {
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      storyPath: storyPath,
      levelProgress: {
        ...prevState.levelProgress,
        phase: 'date',
        customerIndex: 0,
        decision: null,
      },
    }));
  };

  return {
    proceedStoryPath,
    visitNode,
    resetStoryPath,
    openStoryPath
  };
}; 