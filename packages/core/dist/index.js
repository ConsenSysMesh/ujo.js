"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _config = _interopRequireDefault(require("../../config"));

var _badges = _interopRequireDefault(require("../../badges"));

var _licensing = _interopRequireDefault(require("../../licensing"));

function execute() {
  return _execute.apply(this, arguments);
}

function _execute() {
  _execute = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var ujoConfig, web3, accounts, network, txReceipt, ujoBadges, badges;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
            ujoConfig = (0, _config.default)('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
            web3 = ujoConfig.getWeb3(); // const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
            // do not delete, will translate this into documentation

            _context.next = 4;
            return ujoConfig.getAccounts();

          case 4:
            accounts = _context.sent;
            _context.next = 7;
            return ujoConfig.getNetwork();

          case 7:
            network = _context.sent;
            _context.next = 10;
            return ujoConfig.getTransactionReceipt('0xc3ccf36047e8645210f7851d5f01766ba3e2fe5d63d1c034870ad35d589ad620');

          case 10:
            txReceipt = _context.sent;
            _context.next = 13;
            return (0, _badges.default)(ujoConfig);

          case 13:
            ujoBadges = _context.sent;
            _context.next = 16;
            return ujoBadges.getAllBadges();

          case 16:
            badges = _context.sent;
            // const badgesByAddress = await ujoBadges.getBadgesOwnedByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
            // const badgeCheck = await ujoBadges.getBadge('0xc3ccf36047e8645210f7851d5f01766ba3e2fe5d63d1c034870ad35d589ad620');
            // const badgesByCid = await ujoBadges.getBadgesMintedFor('zdpuAsmQBSBLMUejTcys5hJWAW5M2YE6utnVAwgBPrCbBxAGx');
            console.log(badges); // web3.eth.sendTransaction(
            //   {
            //     from: accounts[0],
            //     to: accounts[1],
            //     value: '1000000000000000000',
            //   },
            //   (err, res) => {
            //     console.log('ERROR', err);
            //     console.log('RESULT', res);
            //   },
            // );
            // console.log(accounts);
            // const network = await ujoConfig.getNetwork();
            // const ujoLicensing = await initializeLicensing(ujoConfig);
            // const contract = await ujoLicensing.getLicensingContract();
            // console.log(`contract ${contract}`);
            // sender, cid, beneficiaries, amounts, eth;
            // const sender = '0xE8F08D7dc98be694CDa49430CA01595776909Eac';
            // const cid = 'Qm';
            // const beneficiaries = [sender];
            // const amounts = ['1'];
            // const eth = '1';
            // await ujoLicensing.License(sender, cid, beneficiaries, amounts, eth);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _execute.apply(this, arguments);
}

execute();
//# sourceMappingURL=index.js.map