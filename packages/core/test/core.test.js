import ujoInit from '../../config';
// import initializeBadges from '../../badges';
import initializeLicensing from '../../licensing';

// const BigNumber = require('bignumber.js');

contract('Ujo Core', accounts => {
  let ujoConfig;

  beforeEach(async () => {
    // ujoConfig = ujoInit('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
    ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
    // do not delete, will translate this into documentation
    // const accounts = await ujoConfig.getAccounts();
    // const network = await ujoConfig.getNetwork();

    // const ujoBadges = await initializeBadges(ujoConfig);
    // const badges = await ujoBadges.getBadgesByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
    // console.log(badges);
  });

  it('should create a license', async () => {
    const ujoLicensing = await initializeLicensing(ujoConfig);
    // const exchangeRate = await ujoLicensing.getExchangeRate();
    // console.log(exchangeRate);
    // sender, cid, beneficiaries, amounts, eth;
    const sender = accounts[3];
    const cid = 'Qm';
    const beneficiaries = [accounts[0]];
    const amounts = ['2'];
    const eth = '2';
    await ujoLicensing.License(sender, cid, beneficiaries, amounts, eth);
  });
});
