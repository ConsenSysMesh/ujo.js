import Web3 from 'web3';

export default function ujoInit(web3Provider) {
  // TODO: add network validations (rinkeby or mainnet)
  const web3 = new Web3(web3Provider);
  return {
    // returns the web3 instance
    getWeb3: () => web3,
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
  };
}

async function execute() {
  const ujoConfig = ujoInit('http://localhost:8545');
  const accounts = await ujoConfig.getAccounts();
  const network = await ujoConfig.getNetwork();
  console.log(accounts, network);
}

execute();
