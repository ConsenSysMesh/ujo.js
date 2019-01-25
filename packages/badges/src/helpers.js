import ethUtil from 'ethereumjs-util';
import flat from 'array.prototype.flat';
import moment from 'moment';

export const decodeTxData = eventData =>
  // flattens the array and then decodes the values
  flat(eventData).map(({ transactionHash, args: { nftcid, timeMinted } }) => [
    nftcid,
    moment
      .unix(timeMinted.toString())
      .utc()
      .format('MMMM Do, YYYY'),
    transactionHash,
  ]);

/**
 * Convert the badgeIds into hex strings, so we can use them in the event filters
 *
 * @param {Array<string>} param - array of badges.
 * @param {number} param - value to pad left by.
 */
export function convertBadgeIdsToHex(badgeArray, padLeft) {
  return badgeArray.map(ethUtil.intToHex).map(hexString => padLeft(hexString, 64));
}

/**
 * Determines the ethereum block to begin event log search from
 *
 * @param {number} param - networkId.
 */
export function determineStartBlock(networkId) {
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
