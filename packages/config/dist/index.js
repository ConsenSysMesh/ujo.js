"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ujoInit;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _web = _interopRequireDefault(require("web3"));

var _contractsOracle = require("../../contracts-oracle");

var _utils = require("../../utils");

var _ujoStorage = _interopRequireDefault(require("./ujoStorage"));

function ujoInit(web3Provider, dataStorageProvider) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // TODO: add network validations (rinkeby or mainnet)
  var web3 = new _web.default(web3Provider);
  var storageProvider = (0, _ujoStorage.default)(dataStorageProvider);
  var Oracle = opts.test ? _contractsOracle.TestOracle : _contractsOracle.USDETHOracle;
  return {
    // returns the web3 instance
    getWeb3: function getWeb3() {
      return web3;
    },
    getStorageProvider: function getStorageProvider() {
      return storageProvider;
    },
    getOracleAddress: function getOracleAddress() {
      return new Promise(function (resolve, reject) {
        web3.eth.net.getId(function (err, networkId) {
          if (err) reject(err);else resolve((0, _utils.getContractAddress)(Oracle, networkId));
        });
      });
    },
    getExchangeRate: function getExchangeRate() {
      return new Promise(function (resolve, reject) {
        web3.eth.net.getId(
        /*#__PURE__*/
        function () {
          var _ref = (0, _asyncToGenerator2.default)(
          /*#__PURE__*/
          _regenerator.default.mark(function _callee(err, networkId) {
            var oracleAddress, oracleInstance, exchangeRate;
            return _regenerator.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (err) reject(err);
                    _context.prev = 1;
                    oracleAddress = (0, _utils.getContractAddress)(Oracle, networkId);
                    oracleInstance = new web3.eth.Contract(Oracle.abi, oracleAddress);
                    _context.next = 6;
                    return oracleInstance.methods.getUintPrice().call();

                  case 6:
                    exchangeRate = _context.sent;
                    resolve(exchangeRate.toString(10));
                    _context.next = 13;
                    break;

                  case 10:
                    _context.prev = 10;
                    _context.t0 = _context["catch"](1);
                    reject(_context.t0);

                  case 13:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this, [[1, 10]]);
          }));

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        }());
      });
    },
    // return the accounts given by the provider
    getAccounts: function getAccounts() {
      return new Promise(function (resolve, reject) {
        web3.eth.getAccounts(function (err, accounts) {
          if (err) reject(err);else resolve(accounts);
        });
      });
    },
    // returns the network id
    getNetwork: function getNetwork() {
      return new Promise(function (resolve, reject) {
        web3.eth.net.getId(function (err, networkId) {
          if (err) reject(err);else resolve(networkId);
        });
      });
    },
    getBlockNumber: function getBlockNumber() {
      return new Promise(function (resolve, reject) {
        web3.eth.getBlockNumber(function (err, result) {
          if (err) reject(err);
          resolve(result);
        });
      });
    },

    /**
     * Determines the ethereum block to begin event log search from
     *
     * @param {string} param - txHash of the transaction to check.
     * returns modified version of https://web3js.readthedocs.io/en/1.0/web3-eth.html#eth-gettransactionreceipt-return
     */
    getTransactionReceipt: function () {
      var _getTransactionReceipt = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(txHash) {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  web3.eth.getTransactionReceipt(txHash, function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getTransactionReceipt(_x3) {
        return _getTransactionReceipt.apply(this, arguments);
      }

      return getTransactionReceipt;
    }()
  };
}
//# sourceMappingURL=index.js.map