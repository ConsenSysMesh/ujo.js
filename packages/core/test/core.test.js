import ujoInit from '../../config';
// import initializeBadges from '../../badges';
import initializeLicensing from '../../licensing';

// const BigNumber = require('bignumber.js');

contract('Ujo Core', accounts => {
  let ujoConfig;

  beforeEach(async () => {
    ujoConfig = ujoInit('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
    // const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
    // do not delete, will translate this into documentation
    // const accounts = await ujoConfig.getAccounts();
    // const network = await ujoConfig.getNetwork();

    // const ujoBadges = await initializeBadges(ujoConfig);
    // const badges = await ujoBadges.getBadgesByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
    // console.log(badges);
  });

  it('should transfer money to one beneficiary (buyer == msg.sender)', async () => {
    // const postBeneficiarybalance = beneficiarybalance.add(twoEther);
    // assert.equal(web3.eth.getBalance(accounts[0]).toString(), postBeneficiarybalance.toString());

    const ujoLicensing = await initializeLicensing(ujoConfig);
    const exchangeRate = await ujoLicensing.getExchangeRate();
    console.log(exchangeRate);

    // sender, cid, beneficiaries, amounts, eth;
    const sender = accounts[3];
    const cid = 'Qm';
    const beneficiaries = [accounts[0]];
    const amounts = ['1'];
    const eth = '1';
    await ujoLicensing.License(sender, cid, beneficiaries, amounts, eth);
  });
});
