export const useTrust = (state, setState, updateTimestamp) => {
  const initAllCustomersTrust = (customers) => {
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      customerTrust: prevState.customerTrust || customers
    }));
  };

  const changeTrust = (customerId, trustDelta) => {
    setState((prevState) => ({
      ...prevState,
      customerTrust: {
        ...prevState.customerTrust,
        [customerId]: Math.min(Math.max((prevState.customerTrust[customerId] || 0) + trustDelta, -1), 1)
      }
    }));
  };

  const erodeAllCustomersTrust = (decisionMakerId, erosionFactor = 0.8) => {
    setState((prevState) => ({
      ...prevState,
      timestamp: updateTimestamp(),
      customerTrust: Object.keys(prevState.customerTrust).reduce((acc, customerId) => {
        const currentTrust = prevState.customerTrust[customerId];
        acc[customerId] = (currentTrust + 1) * (customerId === decisionMakerId ? 0.25 : erosionFactor) - 1;
        return acc;
      }, {})
    }));
  };

  return {
    initAllCustomersTrust,
    changeTrust,
    erodeAllCustomersTrust
  };
}; 