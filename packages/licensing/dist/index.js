"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeLicensing;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _dist = require("../../utils/dist");

var _contractsLicensing = require("../../contracts-licensing");

/**
 * Initialize Licensing
 *
 * @param {Object} ujoConfig contains network configuration and optional propertiess
 */
function initializeLicensing(_x) {
  return _initializeLicensing.apply(this, arguments);
}

function _initializeLicensing() {
  _initializeLicensing = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(ujoConfig) {
    var web3, networkId, licensingHandlerAddress, LicensingHandler;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            web3 = ujoConfig.getWeb3();
            _context2.next = 3;
            return ujoConfig.getNetwork();

          case 3:
            networkId = _context2.sent;
            licensingHandlerAddress = (0, _dist.getContractAddress)(_contractsLicensing.ETHUSDHandler, networkId);
            LicensingHandler = new web3.eth.Contract(_contractsLicensing.ETHUSDHandler.abi, licensingHandlerAddress);
            return _context2.abrupt("return", {
              License: function () {
                var _License = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee(cid, buyer, beneficiaries, amounts, notifiers, eth) {
                  var oracleAddress, wei, amountsInWei, gasRequired, gas;
                  return _regenerator.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return ujoConfig.getOracleAddress();

                        case 2:
                          oracleAddress = _context.sent;
                          if (eth) wei = web3.utils.toWei(eth, 'ether'); // Convert ether amounts to wei

                          amountsInWei = amounts.map(function (amount) {
                            return web3.utils.toWei(amount, 'ether');
                          });
                          _context.next = 7;
                          return LicensingHandler.methods.pay(cid, oracleAddress, // which oracle to use for reference
                          buyer, // address
                          beneficiaries, // addresses
                          amountsInWei, // in wei
                          notifiers // contract notifiers [none in this case]
                          ).estimateGas({
                            from: buyer,
                            value: wei
                          });

                        case 7:
                          gasRequired = _context.sent;
                          gas = (0, _dist.boostGas)(gasRequired);
                          return _context.abrupt("return", LicensingHandler.methods.pay(cid, oracleAddress, buyer, beneficiaries, amountsInWei, []).send({
                            from: buyer,
                            value: wei,
                            gas: gas
                          }));

                        case 10:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, this);
                }));

                function License(_x2, _x3, _x4, _x5, _x6, _x7) {
                  return _License.apply(this, arguments);
                }

                return License;
              }()
            });

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _initializeLicensing.apply(this, arguments);
}
//# sourceMappingURL=index.js.map