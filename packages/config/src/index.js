import Web3, { utils } from 'web3';
import BadgeContracts from 'ujo-contracts-badges';
import Truffle from 'truffle-contract';
import ethUtil from 'ethereumjs-util';
import moment from 'moment';
import flat from 'array.prototype.flat';

function ujoInit(web3Provider, dataStorageProvider) {
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
  };
}

// extracts the important data from the event logs
const decodeTxData = eventData =>
  // flattens the array and then decodes the values
  flat(eventData).map(({ transactionHash, args: { nftcid, timeMinted } }) => [
    nftcid,
    moment
      .unix(timeMinted.toString())
      .utc()
      .format('MMMM Do, YYYY'),
    transactionHash,
  ]);

// convert the badgeIds into hex strings, so we can use them in the event filters
function convertBadgeIdsToHex(badgeArray, padLeft) {
  return badgeArray.map(ethUtil.intToHex).map(hexString => padLeft(hexString, 64));
}

function determineStartBlock(networkId) {
  switch (Number(networkId)) {
    // if on mainnet, start event log search on block...
    case 1:
      return 6442621;
    // if on rinkeby, start event log search on block...
    case 4:
      return 3068896;
    // if not on mainnet or rinkeby just start on block 0
    default:
      return 0;
  }
}

async function initializeBadges(ujoConfig) {
  /* --- Initial configuration of the badges --- */
  const web3 = ujoConfig.getWeb3();
  const web3Provider = web3.currentProvider;

  const patronageBadgesProxy = Truffle(BadgeContracts.UjoPatronageBadges);
  const patronageBadgesFunctions = Truffle(BadgeContracts.UjoPatronageBadgesFunctions);

  let patronageBadgeContract = null;
  let deployedProxy = null;

  /* --- connect to the badges contracts on the network passed to ujoConfig ---  */

  try {
    patronageBadgesProxy.setProvider(web3Provider);
    patronageBadgesFunctions.setProvider(web3Provider);

    deployedProxy = await patronageBadgesProxy.deployed();
    patronageBadgeContract = await patronageBadgesFunctions.at(deployedProxy.address);
  } catch (error) {
    console.error('unable to connect to patronage badge contract');
  }

  /* --- functions that need reference to closed over badge context --- */

  /*
    ETHEREUM EVENT LOG PARALLELIZER

    instead of linearly going through ethereum and looking at the event logs of each block
    we go through many chunks of ethereum at the same time, and then join the results together

    This is for performance optimization:

    Instead of one call to `getPastEvents`, which looks like:

    [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
    ^              c h e c k   o n e   b l o c k   a t   a   t i m e                                                                              ^
    start                                                                             end

    We do many chunks at the same time, where blocks are checked linearly in each chunk:

    [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
    |-------------||-------------||-------------||-------------||-------------||-------|
    ^             ^^             ^^             ^^             ^^             ^^       ^
     blockIncrement blockIncrement blockIncrement blockIncrement blockIncrement finalIncrement

    Now, 6 simulataneous calls were made to `getPastEvents`, which is still O(n) time complexity
    but could make a significant difference in the future when ethereum gets extremely long
  */

  async function findEventData(hexBadgesByAddress, blockIncrement, startBlock, endBlock) {
    if (patronageBadgeContract) {
      // create an array to store parallelized calls to ethereum block chunks
      const blockIncrements = new Array(Math.ceil((endBlock - startBlock) / blockIncrement)).fill();
      // optimization for querying event logs by passing event signature
      const eventHash = utils.soliditySha3('LogBadgeMinted(uint256,string,uint256,address,address)');
      // all of these calls get invoked at one after the other, but the entire promise
      // will not resolve until all have completed
      return Promise.all(
        blockIncrements.map((ele, idx) => {
          // craft variables necessary to retrieve specific event logs from ethereum.
          let options;
          // if were at the first chunk of blocks...
          if (idx === 0)
            options = {
              fromBlock: startBlock.toString(),
              toBlock: (startBlock + blockIncrement).toString(),
              // topics are the indexed/searchable paramaters in Ethereum event logs.
              topics: [eventHash, hexBadgesByAddress],
            };
          // if were at the non-first chunk of blocks...
          else {
            const fromBlock = (startBlock + blockIncrement * idx + 1).toString();
            const toBlock = (startBlock + blockIncrement * (idx + 1)).toString();
            options = { fromBlock, toBlock, topics: [eventHash, hexBadgesByAddress] };
          }
          // issue the event logs request to ethereum
          return patronageBadgeContract.getPastEvents('LogBadgeMinted', options);
        }),
      );
    }

    return new Error({ error: 'Attempted to get badge data with no smart contract' });
  }

  async function getBadgeData(badgeHexes, networkId, endBlock) {
    const startBlock = determineStartBlock(networkId);
    const blockIncrement = 5000;
    // parse event logs to look for badgeHexes, from the patronage badge contract from start block to end block
    // parallelizes requests by parsing event logs in chunks of "blockIncrement"
    const encodedTxData = await findEventData(badgeHexes, blockIncrement, startBlock, endBlock);
    // reformats tx data to be useful for clients and/or storage layer
    const eventData = decodeTxData(encodedTxData);
    return eventData;
  }

  return {
    getBadgeContract: () => patronageBadgeContract,
    getBadgesByAddress: async ethereumAddress => {
      try {
        // get the networkID and latest block number
        const [networkId, mostRecentBlockNumber] = await Promise.all([
          ujoConfig.getNetwork(),
          ujoConfig.getBlockNumber(),
        ]);
        // fetch the token IDs owned by ethereum address
        const badgesByAddress = await patronageBadgeContract.getAllTokens.call(ethereumAddress);
        // convert the token IDs into their hex value so we can parse the ethereum event logs for those token IDs
        const hexBadgesByAddress = convertBadgeIdsToHex(badgesByAddress, web3.utils.padLeft);
        // scrape ethereum event logs for badge data associated iwth the given token IDs
        return getBadgeData(hexBadgesByAddress, networkId, mostRecentBlockNumber);
      } catch (error) {
        return new Error({ error: 'Error fetching badges' });
      }
    },
  };
}

async function execute() {
  const ujoConfig = ujoInit('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
  // do not delete, will translate this into documentation
  const accounts = await ujoConfig.getAccounts();
  const network = await ujoConfig.getNetwork();
  const ujoBadges = await initializeBadges(ujoConfig);
  const badges = await ujoBadges.getBadgesByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
  console.log(badges);
}

execute();
