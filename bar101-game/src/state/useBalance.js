export const useBalance = (state, setState) => {
  const changeBalance = (delta) => {
    setState((prevState) => ({
      ...prevState,
      balance: prevState.balance + delta
    }));
  };

  return {
    changeBalance
  };
}; 