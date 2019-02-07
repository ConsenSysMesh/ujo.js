import moment from 'moment';
import { getContractAddress, dollarToWei, boostGas } from '../../utils/dist';
import { UjoPatronageBadges, UjoPatronageBadgesFunctions } from '../../contracts-badges';

import { decodeTxData, determineStartBlock } from './helpers';

class Badges {
  constructor() {
    this.web3 = {};
    this.getExchangeRate = async () => {};
    this.getBlockNumber = async () => {};
    this.networkId = '';
  }

  async init(config) {
    const web3 = config.getWeb3();
    this.web3 = web3;
    this.networkId = await config.getNetwork();
    this.badgesProxyAddress = getContractAddress(UjoPatronageBadges, this.networkId);
    this.badgeContract = new web3.eth.Contract(UjoPatronageBadgesFunctions.abi, this.badgesProxyAddress);

    // Sample storage provider setup
    this.storageProvider = config.getStorageProvider();

    // Functions that need to be executed at runtime
    this.getBlockNumber = config.getBlockNumber;
    this.getExchangeRate = config.getExchangeRate;
    this.getTransactionReceipt = config.getTransactionReceipt;
  }

  async findEventData(tokenIds, blockIncrement, startBlock, endBlock) {
    if (this.badgeContract) {
      // create an array to store parallelized calls to ethereum block chunks
      const blockIncrements = new Array(Math.ceil((endBlock - startBlock) / blockIncrement)).fill();

      // all of these calls get invoked at one after the other, but the entire promise
      // will not resolve until all have completed
      return Promise.all(
        blockIncrements.map((_, idx) => {
          // craft variables necessary to retrieve specific event logs from ethereum.
          let options;
          // if were at the first chunk of blocks...
          if (idx === 0) {
            options = {
              filter: { tokenId: tokenIds },
              fromBlock: startBlock.toString(),
              toBlock: (startBlock + blockIncrement).toString(),
            };
          }
          // if were at the non-first chunk of blocks...
          else {
            const fromBlock = (startBlock + blockIncrement * idx + 1).toString();
            const toBlock = (startBlock + blockIncrement * (idx + 1)).toString();
            const filter = { tokenId: tokenIds };

            options = { fromBlock, toBlock, filter };
          }
          // issue the event logs request to ethereum
          return this.badgeContract.getPastEvents('LogBadgeMinted', options);
        }),
      );
    }
    return new Error({
      error: 'Attempted to get badge data with no smart contract',
    });
  }

  async getBadges(tokenIds, network) {
    const endBlock = await this.getBlockNumber();
    const startBlock = determineStartBlock(network);
    const blockIncrement = 5000;
    // parse event logs to look for badgeHexes, from the patronage badge contract from start block to end block
    // parallelizes requests by parsing event logs in chunks of "blockIncrement"
    const encodedTxData = await this.findEventData(tokenIds, blockIncrement, startBlock, endBlock);
    // reformats tx data to be useful for clients and/or storage layer
    const eventData = decodeTxData(encodedTxData);
    return eventData;
  }

  async getBadgeMetadata(badge) {
    const { data } = await this.storageProvider.fetchMetadataByQueryParameter(badge[0]);
    // reformat data here
    return data;
  }

  async getAllBadges() {
    try {
      // get all the badge data
      // the empty array means all badges (not any specific tokenIds)
      const badges = await this.getBadges(null, this.networkId);
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
  }

  async getBadgesOwnedByAddress(ethereumAddress) {
    try {
      // fetch the token IDs owned by ethereum address
      const tokenIds = await this.badgeContract.methods.getAllTokens(ethereumAddress).call();
      const badges = await this.getBadges(tokenIds, this.networkId);
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
  }

  async getBadgesMintedFor(uniqueIdentifier) {
    const mostRecentBlockNumber = await this.getBlockNumber();
    // get all the badge data
    // the empty array means all badges (not any specific tokenIds)
    const badges = await this.getBadges(null, this.networkId, mostRecentBlockNumber);
    // do we want to return any other data with these badges?
    return badges.filter(badge => badge[0] === uniqueIdentifier);
    // add this snippet to unfurl music group information in badge and reformat badge data
    // .map(getBadgeMetadata)
  }

  async getBadge(txHash) {
    let txReceipt;
    try {
      txReceipt = await this.getTransactionReceipt(txHash);
    } catch (error) {
      return new Error({ error: 'Error getting transaction receipt' });
    }
    if (txReceipt) {
      try {
        // decode the logs from the transaction receipt based on event log signature
        const { nftcid, timeMinted } = this.web3.eth.abi.decodeLog(
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

        // this is the format of how badge data gets returned in the event log
        const data = [nftcid, formattedTimeMinted, txHash];
        // add this snippet to unfurl music group information in badge and reformat badge data
        // const badgeWithMetadata = getBadgeMetadata(data)

        // add the formatted badge data along with the rest of the tx receipt
        // see https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
        return { ...txReceipt, data };
      } catch (error) {
        return new Error({ error: 'Error decoding txReceipt logs' });
      }
    }
    // is this right?
    return null;
  }

  async buyBadge(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice) {
    const exchangeRate = await this.getExchangeRate();
    const amountInWei = dollarToWei(patronageBadgePrice, exchangeRate);
    const gasRequired = await this.badgeContract.methods
      .mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice)
      .estimateGas({
        from: badgeBuyerAddress,
        value: amountInWei,
        to: this.badgeContract.address,
      });

    const gas = boostGas(gasRequired);

    return this.badgeContract.methods
      .mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice)
      .send({
        from: badgeBuyerAddress,
        value: amountInWei,
        to: this.badgeContract.address,
        gas,
      });
  }
}

export default Badges;

// /**
//  * the initializeBadges method provides an API for interacting with ujo patronage badges
//  * @param {Object} ujoConfig - the config object returned by ujoInit @see [link]
//  * @returns {Object} - an interface for interacting with badges
//  */
// export default async function initializeBadges(ujoConfig) {
//   /* --- Initial configuration of the badges --- */
//   const web3 = ujoConfig.getWeb3();

//   const networkId = await ujoConfig.getNetwork();
//   const patronageBadgesProxyAddress = getContractAddress(UjoPatronageBadges, networkId);
//   const patronageBadgeContract = new web3.eth.Contract(UjoPatronageBadgesFunctions.abi, patronageBadgesProxyAddress);

//   // Sample storage provider setup
//   const storageProvider = ujoConfig.getStorageProvider();

//   async function findEventData(tokenIds, blockIncrement, startBlock, endBlock) {
//     if (patronageBadgeContract) {
//       // create an array to store parallelized calls to ethereum block chunks
//       const blockIncrements = new Array(Math.ceil((endBlock - startBlock) / blockIncrement)).fill();

//       // all of these calls get invoked at one after the other, but the entire promise
//       // will not resolve until all have completed
//       return Promise.all(
//         blockIncrements.map((_, idx) => {
//           // craft variables necessary to retrieve specific event logs from ethereum.
//           let options;
//           // if were at the first chunk of blocks...
//           if (idx === 0)
//             options = {
//               filter: { tokenId: tokenIds },
//               fromBlock: startBlock.toString(),
//               toBlock: (startBlock + blockIncrement).toString(),
//             };
//           // if were at the non-first chunk of blocks...
//           else {
//             const fromBlock = (startBlock + blockIncrement * idx + 1).toString();
//             const toBlock = (startBlock + blockIncrement * (idx + 1)).toString();
//             const filter = { tokenId: tokenIds };

//             options = { fromBlock, toBlock, filter };
//           }
//           // issue the event logs request to ethereum
//           return patronageBadgeContract.getPastEvents('LogBadgeMinted', options);
//         }),
//       );
//     }
//     return new Error({ error: 'Attempted to get badge data with no smart contract' });
//   }

//   async function getBadges(tokenIds, network) {
//     const endBlock = await ujoConfig.getBlockNumber();
//     const startBlock = determineStartBlock(network);
//     const blockIncrement = 5000;
//     // parse event logs to look for badgeHexes, from the patronage badge contract from start block to end block
//     // parallelizes requests by parsing event logs in chunks of "blockIncrement"
//     const encodedTxData = await findEventData(tokenIds, blockIncrement, startBlock, endBlock);
//     // reformats tx data to be useful for clients and/or storage layer
//     const eventData = decodeTxData(encodedTxData);
//     return eventData;
//   }

//   /* this function takes a badge in the format given back by getBadges
//     [
//       <String> unique identifier (in our case cid)
//       <String> time minted
//       <String> txHash
//     ]

//     takes the unique identifier, and gets the badgemetadata from the storage provider

//     reformats the badgemetadata for the api spec
//   */
//   async function getBadgeMetadata(badge) {
//     const { data } = await storageProvider.fetchMetadataByQueryParameter(badge[0]);
//     // reformat data here
//     return data;
//   }

//   return {
//     /**
//      * getBadgeContract is a getter method for the ujo badges contract
//      * @returns {Object} instance of the proxy ujo badges truffle contract
//      */
//     getBadgeContract: () => patronageBadgeContract,
//     /**
//      * getAllBadges is a getter method for every single badge in the proxy contract
//      * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
//      */
//     getAllBadges: async () => {
//       try {
//         // get all the badge data
//         // the empty array means all badges (not any specific tokenIds)
//         const badges = await getBadges(null, networkId);
//         // add this snippet to unfurl music group data in badges and reformat badge data
//         // try {
//         //   const badgesWithMetadata = await Promise.all(badges.map(getBadgeMetadata));
//         // } catch (error) {
//         //   return new Error({ error: 'most likely hit an endpoint rate limit' });
//         // }
//         return badges;
//       } catch (error) {
//         return new Error({ error: 'Error fetching badges' });
//       }
//     },
//     /**
//      * getBadgesOwnedByAddress is a getter method for every single badge owned by ethereum address
//      * @param {string} ethereumAddress - the ethereum address owner of returned badges
//      * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
//      */
//     getBadgesOwnedByAddress: async ethereumAddress => {
//       try {
//         // fetch the token IDs owned by ethereum address
//         const tokenIds = await patronageBadgeContract.methods.getAllTokens(ethereumAddress).call();
//         const badges = await getBadges(tokenIds, networkId);
//         /* --- add this snippet to unfurl music group metadata within the badges and reformat the badges --- */
//         // try {
//         //   const badgesWithMetadata = await Promise.all(badges.map(getBadgeMetadata));
//         // } catch (error) {
//         //   return new Error({ error: 'most likely hit an endpoint rate limit' });
//         // }

//         return badges;
//       } catch (error) {
//         return new Error({ error: 'Error fetching badges' });
//       }
//     },
//     /**
//      * getBadgesMintedFor is a getter method for every single badge representing a unique id (in our case music group IPFS cid) by ethereum address
//      * @param {string} uniqueId - the unique id that the badge represents (in our case it's an IPFS cid)
//      * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
//      */
//     getBadgesMintedFor: async uniqueIdentifier => {
//       const mostRecentBlockNumber = await ujoConfig.getBlockNumber();
//       // get all the badge data
//       // the empty array means all badges (not any specific tokenIds)
//       const badges = await getBadges(null, networkId, mostRecentBlockNumber);
//       // do we want to return any other data with these badges?
//       return badges.filter(badge => badge[0] === uniqueIdentifier);
//       // add this snippet to unfurl music group information in badge and reformat badge data
//       // .map(getBadgeMetadata)
//     },
//     // meant to get more information about the badges
//     // returns transaction receipt along with formatted badge data @ prop 'badge'
//     // const badge = await ujoBadges.getBadge()
//     // badge.data
//     // returns null if transaction has not been mined to chain yet
//     /**
//      * getBadge is a getter method for a single badge
//      * @param {string} txHash - the transaction hash of the badge minting
//      * @returns {Promise<Object, Error>} a single badge object
//      * @todo decide on this object ^^
//      *
//      * @example
//      * import ujoInit from 'ujo.js/config'
//      * const ujoConfig = ujoInit(<Web3Provider>)
//      * const ujoBadges = await initializeBadges(ujoConfig)
//      * const badge = await ujoBadges.getBadge('0xb8eedb9637e423b73df56f456d7a68161af281d0dce3ec4b2f3f977f28226b5e')
//      */
//     getBadge: async txHash => {
//       let txReceipt;
//       try {
//         txReceipt = await ujoConfig.getTransactionReceipt(txHash);
//       } catch (error) {
//         return new Error({ error: 'Error getting transaction receipt' });
//       }
//       if (txReceipt) {
//         try {
//           // decode the logs from the transaction receipt based on event log signature
//           const { nftcid, timeMinted } = web3.eth.abi.decodeLog(
//             [
//               { indexed: true, name: 'tokenId', type: 'uint256' },
//               { indexed: false, name: 'nftcid', type: 'string' },
//               { indexed: false, name: 'timeMinted', type: 'uint256' },
//               { indexed: false, name: 'buyer', type: 'address' },
//               { indexed: false, name: 'issuer', type: 'address' },
//             ],
//             txReceipt.logs[0].data,
//             txReceipt.logs[0].topics,
//           );
//           const formattedTimeMinted = moment
//             .unix(timeMinted)
//             .utc()
//             .format('MMMM Do, YYYY');

//           // this is the format of how badge data gets returned in the event log
//           const data = [nftcid, formattedTimeMinted, txHash];
//           // add this snippet to unfurl music group information in badge and reformat badge data
//           // const badgeWithMetadata = getBadgeMetadata(data)

//           // add the formatted badge data along with the rest of the tx receipt
//           // see https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
//           return { ...txReceipt, data };
//         } catch (error) {
//           return new Error({ error: 'Error decoding txReceipt logs' });
//         }
//       }
//       // is this right?
//       return null;
//     },
//     /**
//      * mints a new badge
//      * @param {string} badgeBuyerAddress - the eth address of the owner of the new badge
//      * @param {string} uniqueIdentifier - the resource that the newly minted badge represents (cid in our case)
//      * @param {string[]} beneficiaries - an array of ethereum addresses who will receive the money paid for the badge
//      * @param {number[]} splits - an array of integers that represent the amount paid to each beneficiary (out of 100). Must be in the same order as the beneficiary
//      * @param {number} patronageBadgePrice - the amount the badge costs in USD
//      */
//     buyBadge: async (badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice) => {
//       const exchangeRate = await ujoConfig.getExchangeRate();
//       const amountInWei = dollarToWei(patronageBadgePrice, exchangeRate);
//       const gasRequired = await patronageBadgeContract.methods
//         .mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice)
//         .estimateGas({
//           from: badgeBuyerAddress,
//           value: amountInWei,
//           to: patronageBadgeContract.address,
//         });

//       const gas = boostGas(gasRequired);

//       return patronageBadgeContract.methods
//         .mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice)
//         .send({
//           from: badgeBuyerAddress,
//           value: amountInWei,
//           to: patronageBadgeContract.address,
//           gas,
//         });
//     },
//   };
// }
