import { utils } from 'web3';
import BadgeContracts from 'ujo-contracts-badges';
import Truffle from 'truffle-contract';
import moment from 'moment';

import { decodeTxData, convertBadgeIdsToHex, determineStartBlock } from './helpers';

export default async function initializeBadges(ujoConfig) {
  /* --- Initial configuration of the badges --- */
  const web3 = ujoConfig.getWeb3();
  const web3Provider = web3.currentProvider;

  const patronageBadgesProxy = Truffle(BadgeContracts.UjoPatronageBadges);
  const patronageBadgesFunctions = Truffle(BadgeContracts.UjoPatronageBadgesFunctions);

  let patronageBadgeContract = null;
  let deployedProxy = null;

  /* --- Sample storage provider setup --- */
  const storageProvider = ujoConfig.getStorageProvider();

  /* --- connect to the badges contracts on the network passed to ujoConfig ---  */

  try {
    patronageBadgesProxy.setProvider(web3Provider);
    patronageBadgesFunctions.setProvider(web3Provider);

    deployedProxy = await patronageBadgesProxy.deployed();
    patronageBadgeContract = await patronageBadgesFunctions.at(deployedProxy.address);
  } catch (error) {
    console.error('unable to connect to patronage badge contract');
  }

  /**
   * Functions that need reference to closed over badge context
   * ETHEREUM EVENT LOG PARALLELIZER
   * instead of linearly going through ethereum and looking at the event logs of each block
   * we go through many chunks of ethereum at the same time, and then join the results together
   *
   * This is for performance optimization:
   * Instead of one call to `getPastEvents`, which looks like:
   * [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
   * ^              c h e c k   o n e   b l o c k   a t   a   t i m e                  ^
   * start                                                                             end
   * We do many chunks at the same time, where blocks are checked linearly in each chunk:
   *
   * [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
   * |-------------||-------------||-------------||-------------||-------------||-------|
   * ^             ^^             ^^             ^^             ^^             ^^       ^
   * blockIncrement blockIncrement blockIncrement blockIncrement blockIncrement finalIncrement
   * Now, 6 simulataneous calls were made to `getPastEvents`, which is still O(n) time complexity
   * but could make a significant difference in the future when ethereum gets extremely long
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

  async function getBadges(badgeHexes, networkId, endBlock) {
    const startBlock = determineStartBlock(networkId);
    const blockIncrement = 5000;
    // parse event logs to look for badgeHexes, from the patronage badge contract from start block to end block
    // parallelizes requests by parsing event logs in chunks of "blockIncrement"
    const encodedTxData = await findEventData(badgeHexes, blockIncrement, startBlock, endBlock);
    // reformats tx data to be useful for clients and/or storage layer
    const eventData = decodeTxData(encodedTxData);
    return eventData;
  }

  /* this function takes a badge in the format given back by getBadges
    [
      <String> unique identifier (in our case cid)
      <String> time minted
      <String> txHash
    ]

    takes the unique identifier, and gets the badgemetadata from the storage provider

    reformats the badgemetadata for the api spec
  */
  async function getBadgeMetadata(badge) {
    const { data } = await storageProvider.fetchMetadataByQueryParameter(badge[0]);
    // reformat data here
    return data;
  }

  return {
    getBadgeContract: () => patronageBadgeContract,
    getAllBadges: async () => {
      try {
        // get the networkID and latest block number
        const [networkId, mostRecentBlockNumber] = await Promise.all([
          ujoConfig.getNetwork(),
          ujoConfig.getBlockNumber(),
        ]);
        // get all the badge data
        // the empty array means all badges (not any specific tokenIds)
        const badges = await getBadges([], networkId, mostRecentBlockNumber);
        // add this snippet to unfurl music group data in badges and reformat badge data
        // try {
        //   const badgesWithMetadata = await Promise.all(badges.map(getBadgeMetadata));
        // } catch (error) {
        //   return new Error({ error: 'most likely hit an endpoint rate limit' });
        // }
        return badges;
      } catch (error) {
        return new Error({ error: 'Error fetching badges' });
      }
    },
    getBadgesOwnedByAddress: async ethereumAddress => {
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
        if (!hexBadgesByAddress.length) return [];
        // scrape ethereum event logs for badge data associated iwth the given token IDs
        const badges = await getBadges(hexBadgesByAddress, networkId, mostRecentBlockNumber);
        /* --- add this snippet to unfurl music group metadata within the badges and reformat the badges --- */
        // try {
        //   const badgesWithMetadata = await Promise.all(badges.map(getBadgeMetadata));
        // } catch (error) {
        //   return new Error({ error: 'most likely hit an endpoint rate limit' });
        // }

        return badges;
      } catch (error) {
        return new Error({ error: 'Error fetching badges' });
      }
    },
    // meant to fetch all the badges minted for some unique string (in our case music group cid)
    getBadgesMintedFor: async uniqueIdentifier => {
      const [networkId, mostRecentBlockNumber] = await Promise.all([
        ujoConfig.getNetwork(),
        ujoConfig.getBlockNumber(),
      ]);
      // get all the badge data
      // the empty array means all badges (not any specific tokenIds)
      const badges = await getBadges([], networkId, mostRecentBlockNumber);

      return badges.filter(badge => badge[0] === uniqueIdentifier);
    },
    // meant to get more information about the badges
    // returns transaction receipt along with formatted badge data @ prop 'badge'
    // const badge = await ujoBadges.getBadge()
    // badge.data
    // returns null if transaction has not been mined to chain yet
    getBadge: async txHash => {
      let txReceipt;
      try {
        txReceipt = await ujoConfig.getTransactionReceipt(txHash);
      } catch (error) {
        return new Error({ error: 'Error getting transaction receipt' });
      }
      if (txReceipt) {
        try {
          // decode the logs from the transaction receipt based on event log signature
          const { nftcid, timeMinted } = web3.eth.abi.decodeLog(
            [
              { indexed: true, name: 'tokenId', type: 'uint256' },
              { indexed: false, name: 'nftcid', type: 'string' },
              { indexed: false, name: 'timeMinted', type: 'uint256' },
              { indexed: false, name: 'buyer', type: 'address' },
              { indexed: false, name: 'issuer', type: 'address' },
            ],
            txReceipt.logs[0].data,
            txReceipt.logs[0].topics,
          );
          const formattedTimeMinted = moment
            .unix(timeMinted)
            .utc()
            .format('MMMM Do, YYYY');

          const data = [nftcid, formattedTimeMinted, txHash];
          // add this snippet to unfurl music group information in badge and reformat badge data
          // const badgeWithMetadata = getBadgeMetadata(data)
          return { ...txReceipt, data };
        } catch (error) {
          return new Error({ error: 'Error decoding txReceipt logs' });
        }
      }
      return null;
    },
  };
}
