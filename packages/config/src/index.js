import Web3 from 'web3';

export default function ujoInit(web3Provider, dataStorageProvider) {
  // TODO: add network validations (rinkeby or mainnet)
  const web3 = new Web3(web3Provider);
  const storageProvider = dataStorageProvider.toLowerCase() || 'ipfs';
  return {
    // returns the web3 instance
    getWeb3: () => web3,
    getStorageProvider: () => storageProvider,
    // return the accounts given by the provider
    getAccounts: () =>
      new Promise((resolve, reject) => {
        web3.eth.getAccounts((err, accounts) => {
          if (err) reject(err);
          else resolve(accounts);
        });
      }),
    // returns the network id
    getNetwork: () =>
      new Promise((resolve, reject) => {
        web3.eth.net.getId((err, networkId) => {
          if (err) reject(err);
          else resolve(networkId);
        });
      }),
    getBlockNumber: () =>
      new Promise((resolve, reject) => {
        web3.eth.getBlockNumber((err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      }),
    /**
     * Determines the ethereum block to begin event log search from
     *
     * @param {string} param - txHash of the transaction to check.
     * returns modified version of https://web3js.readthedocs.io/en/1.0/web3-eth.html#eth-gettransactionreceipt-return
     */
    getTransactionReceipt: async txHash =>
      new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(txHash, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      }),
  };
}
