import ujoInit from '../../config';
import LicensingContracts from '../../contracts/licensing/build/contracts/ETHUSDHandler.json';
import initializeLicensing from '..';

const keystore = require('./accounts');

describe('Licensing tests', () => {
  let ujoConfig;

  beforeEach(async () => {
    ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
    // const web3 = ujoConfig.getWeb3();
    // const web3Provider = web3.currentProvider;
  });

  it('gets the exchange rate', async () => {
    const ujoLicensing = await initializeLicensing(ujoConfig, { test: true });
    const exchangeRate = await ujoLicensing.getExchangeRate();
    console.log(`  Exchange rate ${exchangeRate}`);
  });

  it('should create a license', async () => {
    // const accounts = keystore.keys.map(({ address }) => address);
    const ujoLicensing = await initializeLicensing(ujoConfig, { test: true });

    const cid = 'Qm';
    const oracle = '0x9f8e882071bc29313E4C403720EB0EF04aB85013';
    const buyer = '0x09c478cbfc9e7d2d6bc5482c9936f038ed2f7b80';
    const beneficiaries = ['0x3249c9b7f3cc4d2d46bb6fd6d9e42a72b2001d03'];
    const amounts = ['2'];
    const eth = '2';
    const test = await ujoLicensing.License(cid, oracle, buyer, beneficiaries, amounts, [], eth);
    console.log(test);
  });
});
