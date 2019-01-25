import Truffle from 'truffle-contract';

import ujoInit from '../../config';
import LicensingContracts from '../build/contracts/ETHUSDHandler.json';

import initializeLicensing from '..';

// const BigNumber = require('bignumber.js');

contract('Ujo Licensing', accounts => {
  let ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');

  beforeEach(async () => {
    ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
    const web3 = ujoConfig.getWeb3();
    const web3Provider = web3.currentProvider;
    const LicensingHandler = Truffle(LicensingContracts.ETHUSDHandler);
    await LicensingHandler.setProvider(web3Provider);
    const Oracle = Truffle(LicensingContracts.TestOracle);
    await Oracle.setProvider(web3Provider);
  });

  it('gets the exchange rate', async () => {
    const ujoLicensing = await initializeLicensing(ujoConfig);
    await ujoLicensing.getExchangeRate();
  });

  it('should create a license', async () => {
    const ujoLicensing = await initializeLicensing(ujoConfig);
    const sender = accounts[3];
    const cid = 'Qm';
    const beneficiaries = [accounts[0]];
    const amounts = ['2'];
    const eth = '2';
    let test = await ujoLicensing.License(sender, cid, beneficiaries, amounts, eth);
    console.log(test);
  });
});
