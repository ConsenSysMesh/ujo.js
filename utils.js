export const getContractAddress = (contractAbi, networkId) => {
  const network = networkId.toString();
  return contractAbi.networks[network].address;
};

/**
 * Adds a 5% boost to the gas for web3 calls as to ensure tx's go through
 *
 * @param {string} gasRequired amount of gas required from `estimateGas`
 */
export const boostGas = (gasRequired, BN) => {
  const gasBoost = new BN(gasRequired, 10).divRound(new BN('20'));
  return new BN(gasRequired, 10).add(gasBoost);
};
