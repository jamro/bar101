export const useLevelProgress = (state, setState, updateTimestamp) => {
  const setLevelPhase = (phase) => {
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      levelProgress: {
        ...prevState.levelProgress,
        phase
      }
    }));
  };

  const proceedToNextCustomer = () => {
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      levelProgress: {
        ...prevState.levelProgress,
        customerIndex: prevState.levelProgress.customerIndex + 1
      }
    }));
  };

  const setDilemmaDecision = (decision) => {
    setState((prevState) => ({
      ...prevState,
      levelProgress: {
        ...prevState.levelProgress,
        decision
      }
    }));
  };

  return {
    setLevelPhase,
    proceedToNextCustomer,
    setDilemmaDecision
  };
}; 