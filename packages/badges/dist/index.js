"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeBadges;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _web = require("web3");

var _moment = _interopRequireDefault(require("moment"));

var _dist = require("../../utils/dist");

var _contractsBadges = require("../../contracts-badges");

var _helpers = require("./helpers");

/**
 * the initializeBadges method provides an API for interacting with ujo patronage badges
 * @param {Object} ujoConfig - the config object returned by ujoInit @see [link]
 * @returns {Object} - an interface for interacting with badges
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit('http://127.0.0.1:8545')
 * const ujoBadges = await initializeBadges(ujoConfig)
 */
function initializeBadges(_x) {
  return _initializeBadges.apply(this, arguments);
}

function _initializeBadges() {
  _initializeBadges = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9(ujoConfig) {
    var web3, networkId, patronageBadgesProxyAddress, patronageBadgeContract, storageProvider, findEventData, _findEventData, getBadges, _getBadges, getBadgeMetadata, _getBadgeMetadata;

    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _getBadgeMetadata = function _ref7() {
              _getBadgeMetadata = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee8(badge) {
                var _ref, data;

                return _regenerator.default.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return storageProvider.fetchMetadataByQueryParameter(badge[0]);

                      case 2:
                        _ref = _context8.sent;
                        data = _ref.data;
                        return _context8.abrupt("return", data);

                      case 5:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8, this);
              }));
              return _getBadgeMetadata.apply(this, arguments);
            };

            getBadgeMetadata = function _ref6(_x9) {
              return _getBadgeMetadata.apply(this, arguments);
            };

            _getBadges = function _ref5() {
              _getBadges = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee7(badgeHexes, network, endBlock) {
                var startBlock, blockIncrement, encodedTxData, eventData;
                return _regenerator.default.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        startBlock = (0, _helpers.determineStartBlock)(network);
                        blockIncrement = 5000; // parse event logs to look for badgeHexes, from the patronage badge contract from start block to end block
                        // parallelizes requests by parsing event logs in chunks of "blockIncrement"

                        _context7.next = 4;
                        return findEventData(badgeHexes, blockIncrement, startBlock, endBlock);

                      case 4:
                        encodedTxData = _context7.sent;
                        // reformats tx data to be useful for clients and/or storage layer
                        eventData = (0, _helpers.decodeTxData)(encodedTxData);
                        return _context7.abrupt("return", eventData);

                      case 7:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7, this);
              }));
              return _getBadges.apply(this, arguments);
            };

            getBadges = function _ref4(_x6, _x7, _x8) {
              return _getBadges.apply(this, arguments);
            };

            _findEventData = function _ref3() {
              _findEventData = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee6(hexBadgesByAddress, blockIncrement, startBlock, endBlock) {
                var blockIncrements, eventHash;
                return _regenerator.default.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        if (!patronageBadgeContract) {
                          _context6.next = 4;
                          break;
                        }

                        // create an array to store parallelized calls to ethereum block chunks
                        blockIncrements = new Array(Math.ceil((endBlock - startBlock) / blockIncrement)).fill(); // optimization for querying event logs by passing event signature

                        eventHash = _web.utils.soliditySha3('LogBadgeMinted(uint256,string,uint256,address,address)'); // all of these calls get invoked at one after the other, but the entire promise
                        // will not resolve until all have completed

                        return _context6.abrupt("return", Promise.all(blockIncrements.map(function (ele, idx) {
                          // craft variables necessary to retrieve specific event logs from ethereum.
                          var options; // if were at the first chunk of blocks...

                          if (idx === 0) options = {
                            fromBlock: startBlock.toString(),
                            toBlock: (startBlock + blockIncrement).toString(),
                            // topics are the indexed/searchable paramaters in Ethereum event logs.
                            topics: [eventHash, hexBadgesByAddress]
                          }; // if were at the non-first chunk of blocks...
                          else {
                              var fromBlock = (startBlock + blockIncrement * idx + 1).toString();
                              var toBlock = (startBlock + blockIncrement * (idx + 1)).toString();
                              options = {
                                fromBlock: fromBlock,
                                toBlock: toBlock,
                                topics: [eventHash, hexBadgesByAddress]
                              };
                            } // issue the event logs request to ethereum

                          return patronageBadgeContract.getPastEvents('LogBadgeMinted', options);
                        })));

                      case 4:
                        return _context6.abrupt("return", new Error({
                          error: 'Attempted to get badge data with no smart contract'
                        }));

                      case 5:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6, this);
              }));
              return _findEventData.apply(this, arguments);
            };

            findEventData = function _ref2(_x2, _x3, _x4, _x5) {
              return _findEventData.apply(this, arguments);
            };

            /* --- Initial configuration of the badges --- */
            web3 = ujoConfig.getWeb3();
            _context9.next = 9;
            return ujoConfig.getNetwork();

          case 9:
            networkId = _context9.sent;
            patronageBadgesProxyAddress = (0, _dist.getContractAddress)(_contractsBadges.UjoPatronageBadges, networkId);
            patronageBadgeContract = new web3.eth.Contract(_contractsBadges.UjoPatronageBadgesFunctions.abi, patronageBadgesProxyAddress);
            /* --- Sample storage provider setup --- */

            storageProvider = ujoConfig.getStorageProvider();
            /*
              Functions that need reference to closed over badge context
              ETHEREUM EVENT LOG PARALLELIZER
              instead of linearly going through ethereum and looking at the event logs of each block
              we go through many chunks of ethereum at the same time, and then join the results together
               This is for performance optimization:
              Instead of one call to `getPastEvents`, which looks like:
              [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
              ^              c h e c k   o n e   b l o c k   a t   a   t i m e                  ^
              start                                                                             end
              We do many chunks at the same time, where blocks are checked linearly in each chunk:
               [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
              |-------------||-------------||-------------||-------------||-------------||-------|
              ^             ^^             ^^             ^^             ^^             ^^       ^
              blockIncrement blockIncrement blockIncrement blockIncrement blockIncrement finalIncrement
              Now, 6 simulataneous calls were made to `getPastEvents`, which is still O(n) time complexity
              but could make a significant difference in the future when ethereum gets extremely long
             */

            return _context9.abrupt("return", {
              /**
               * getBadgeContract is a getter method for the ujo badges contract
               * @returns {Object} instance of the proxy ujo badges truffle contract
               *
               * @example
               * import ujoInit from 'ujo.js/config'
               * const ujoConfig = ujoInit(<Web3Provider>)
               * const ujoBadges = await initializeBadges(ujoConfig)
               * const badgeContract = ujoBadges.getBadgeContract()
               */
              getBadgeContract: function getBadgeContract() {
                return patronageBadgeContract;
              },

              /**
               * getAllBadges is a getter method for every single badge in the proxy contract
               * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
               *
               * @example
               * import ujoInit from 'ujo.js/config'
               * const ujoConfig = ujoInit(<Web3Provider>)
               * const ujoBadges = await initializeBadges(ujoConfig)
               * const badges = await ujoBadges.getBadgeContract()
               */
              getAllBadges: function () {
                var _getAllBadges = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee() {
                  var mostRecentBlockNumber, badges;
                  return _regenerator.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.prev = 0;
                          _context.next = 3;
                          return ujoConfig.getBlockNumber();

                        case 3:
                          mostRecentBlockNumber = _context.sent;
                          _context.next = 6;
                          return getBadges(null, networkId, mostRecentBlockNumber);

                        case 6:
                          badges = _context.sent;
                          return _context.abrupt("return", badges);

                        case 10:
                          _context.prev = 10;
                          _context.t0 = _context["catch"](0);
                          return _context.abrupt("return", new Error({
                            error: 'Error fetching badges'
                          }));

                        case 13:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, this, [[0, 10]]);
                }));

                function getAllBadges() {
                  return _getAllBadges.apply(this, arguments);
                }

                return getAllBadges;
              }(),

              /**
               * getBadgesOwnedByAddress is a getter method for every single badge owned by ethereum address
               * @param {string} ethereumAddress - the ethereum address owner of returned badges
               * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
               *
               * @example
               * import ujoInit from 'ujo.js/config'
               * const ujoConfig = ujoInit(<Web3Provider>)
               * const ujoBadges = await initializeBadges(ujoConfig)
               * const badges = await ujoBadges.getBadgesOwnedByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac')
               */
              getBadgesOwnedByAddress: function () {
                var _getBadgesOwnedByAddress = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee2(ethereumAddress) {
                  var mostRecentBlockNumber, badgesByAddress, hexBadgesByAddress, badges;
                  return _regenerator.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.prev = 0;
                          _context2.next = 3;
                          return ujoConfig.getBlockNumber();

                        case 3:
                          mostRecentBlockNumber = _context2.sent;
                          _context2.next = 6;
                          return patronageBadgeContract.methods.getAllTokens(ethereumAddress).call();

                        case 6:
                          badgesByAddress = _context2.sent;
                          // convert the token IDs into their hex value so we can parse the ethereum event logs for those token IDs
                          hexBadgesByAddress = (0, _helpers.convertBadgeIdsToHex)(badgesByAddress, web3.utils.padLeft);

                          if (hexBadgesByAddress.length) {
                            _context2.next = 10;
                            break;
                          }

                          return _context2.abrupt("return", []);

                        case 10:
                          _context2.next = 12;
                          return getBadges(hexBadgesByAddress, networkId, mostRecentBlockNumber);

                        case 12:
                          badges = _context2.sent;
                          return _context2.abrupt("return", badges);

                        case 16:
                          _context2.prev = 16;
                          _context2.t0 = _context2["catch"](0);
                          return _context2.abrupt("return", new Error({
                            error: 'Error fetching badges'
                          }));

                        case 19:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2, this, [[0, 16]]);
                }));

                function getBadgesOwnedByAddress(_x10) {
                  return _getBadgesOwnedByAddress.apply(this, arguments);
                }

                return getBadgesOwnedByAddress;
              }(),

              /**
               * getBadgesMintedFor is a getter method for every single badge representing a unique id (in our case music group IPFS cid) by ethereum address
               * @param {string} uniqueId - the unique id that the badge represents (in our case it's an IPFS cid)
               * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
               *
               * @example
               * import ujoInit from 'ujo.js/config'
               * const ujoConfig = ujoInit(<Web3Provider>)
               * const ujoBadges = await initializeBadges(ujoConfig)
               * const badges = await ujoBadges.getBadgesMintedFor('zdpuAviMaYYFTBiW54TLV11h93mB1txF6zccoF5fKpu9nsub8')
               */
              getBadgesMintedFor: function () {
                var _getBadgesMintedFor = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee3(uniqueIdentifier) {
                  var mostRecentBlockNumber, badges;
                  return _regenerator.default.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.next = 2;
                          return ujoConfig.getBlockNumber();

                        case 2:
                          mostRecentBlockNumber = _context3.sent;
                          _context3.next = 5;
                          return getBadges([], networkId, mostRecentBlockNumber);

                        case 5:
                          badges = _context3.sent;
                          return _context3.abrupt("return", badges.filter(function (badge) {
                            return badge[0] === uniqueIdentifier;
                          }));

                        case 7:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee3, this);
                }));

                function getBadgesMintedFor(_x11) {
                  return _getBadgesMintedFor.apply(this, arguments);
                }

                return getBadgesMintedFor;
              }(),
              // meant to get more information about the badges
              // returns transaction receipt along with formatted badge data @ prop 'badge'
              // const badge = await ujoBadges.getBadge()
              // badge.data
              // returns null if transaction has not been mined to chain yet

              /**
               * getBadge is a getter method for a single badge
               * @param {string} txHash - the transaction hash of the badge minting
               * @returns {Promise<Object, Error>} a single badge object
               * @todo decide on this object ^^
               *
               * @example
               * import ujoInit from 'ujo.js/config'
               * const ujoConfig = ujoInit(<Web3Provider>)
               * const ujoBadges = await initializeBadges(ujoConfig)
               * const badge = await ujoBadges.getBadge('0xb8eedb9637e423b73df56f456d7a68161af281d0dce3ec4b2f3f977f28226b5e')
               */
              getBadge: function () {
                var _getBadge = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee4(txHash) {
                  var txReceipt, _web3$eth$abi$decodeL, nftcid, timeMinted, formattedTimeMinted, data;

                  return _regenerator.default.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          _context4.prev = 0;
                          _context4.next = 3;
                          return ujoConfig.getTransactionReceipt(txHash);

                        case 3:
                          txReceipt = _context4.sent;
                          _context4.next = 9;
                          break;

                        case 6:
                          _context4.prev = 6;
                          _context4.t0 = _context4["catch"](0);
                          return _context4.abrupt("return", new Error({
                            error: 'Error getting transaction receipt'
                          }));

                        case 9:
                          if (!txReceipt) {
                            _context4.next = 20;
                            break;
                          }

                          _context4.prev = 10;
                          // decode the logs from the transaction receipt based on event log signature
                          _web3$eth$abi$decodeL = web3.eth.abi.decodeLog([{
                            indexed: true,
                            name: 'tokenId',
                            type: 'uint256'
                          }, {
                            indexed: false,
                            name: 'nftcid',
                            type: 'string'
                          }, {
                            indexed: false,
                            name: 'timeMinted',
                            type: 'uint256'
                          }, {
                            indexed: false,
                            name: 'buyer',
                            type: 'address'
                          }, {
                            indexed: false,
                            name: 'issuer',
                            type: 'address'
                          }], txReceipt.logs[0].data, txReceipt.logs[0].topics), nftcid = _web3$eth$abi$decodeL.nftcid, timeMinted = _web3$eth$abi$decodeL.timeMinted;
                          formattedTimeMinted = _moment.default.unix(timeMinted).utc().format('MMMM Do, YYYY'); // this is the format of how badge data gets returned in the event log

                          data = [nftcid, formattedTimeMinted, txHash]; // add this snippet to unfurl music group information in badge and reformat badge data
                          // const badgeWithMetadata = getBadgeMetadata(data)
                          // add the formatted badge data along with the rest of the tx receipt
                          // see https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt

                          return _context4.abrupt("return", (0, _objectSpread2.default)({}, txReceipt, {
                            data: data
                          }));

                        case 17:
                          _context4.prev = 17;
                          _context4.t1 = _context4["catch"](10);
                          return _context4.abrupt("return", new Error({
                            error: 'Error decoding txReceipt logs'
                          }));

                        case 20:
                          return _context4.abrupt("return", null);

                        case 21:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4, this, [[0, 6], [10, 17]]);
                }));

                function getBadge(_x12) {
                  return _getBadge.apply(this, arguments);
                }

                return getBadge;
              }(),

              /**
               * mints a new badge
               * @param {string} badgeBuyerAddress - the eth address of the owner of the new badge
               * @param {string} uniqueIdentifier - the resource that the newly minted badge represents (cid in our case)
               * @param {string[]} beneficiaries - an array of ethereum addresses who will receive the money paid for the badge
               * @param {number[]} splits - an array of integers that represent the amount paid to each beneficiary (out of 100). Must be in the same order as the beneficiary
               * @param {number} patronageBadgePrice - the amount the badge costs in USD
               */
              buyBadge: function () {
                var _buyBadge = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee5(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice) {
                  var exchangeRate, amountInWei, gasRequired, gas;
                  return _regenerator.default.wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          _context5.next = 2;
                          return ujoConfig.getExchangeRate();

                        case 2:
                          exchangeRate = _context5.sent;
                          amountInWei = (0, _dist.dollarToWei)(patronageBadgePrice, exchangeRate);
                          _context5.next = 6;
                          return patronageBadgeContract.methods.mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice).estimateGas({
                            from: badgeBuyerAddress,
                            value: amountInWei,
                            to: patronageBadgeContract.address
                          });

                        case 6:
                          gasRequired = _context5.sent;
                          gas = (0, _dist.boostGas)(gasRequired);
                          return _context5.abrupt("return", patronageBadgeContract.methods.mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice).send({
                            from: badgeBuyerAddress,
                            value: amountInWei,
                            to: patronageBadgeContract.address,
                            gas: gas
                          }));

                        case 9:
                        case "end":
                          return _context5.stop();
                      }
                    }
                  }, _callee5, this);
                }));

                function buyBadge(_x13, _x14, _x15, _x16, _x17) {
                  return _buyBadge.apply(this, arguments);
                }

                return buyBadge;
              }()
            });

          case 14:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));
  return _initializeBadges.apply(this, arguments);
}
//# sourceMappingURL=index.js.map