import { getContractAddress } from 'utils';
import { TestOracle } from 'licensing-contracts';

import ujoInit from '../../config';
import initializeLicensing from '..';

const keystore = require('./accounts');

describe('Licensing tests', async () => {
  const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');

  it('gets the exchange rate', async () => {
    const ujoLicensing = await initializeLicensing(ujoConfig, { test: true });
    const exchangeRate = await ujoLicensing.getExchangeRate();
    console.log(`  Exchange rate ${exchangeRate}`);
  });

  it('should create a license', async () => {
    // const accounts = keystore.keys.map(({ address }) => address);
    const ujoLicensing = await initializeLicensing(ujoConfig, { test: true });
    const networkId = await ujoConfig.getNetwork();
    const testOracleAddress = getContractAddress(TestOracle, networkId);
    const cid = 'Qm';
    const oracle = testOracleAddress;
    const buyer = '0xd287a4d332663312b541ee9bbcd522600d816d46';
    const beneficiaries = ['0x3249c9b7f3cc4d2d46bb6fd6d9e42a72b2001d03'];
    const amounts = ['2'];
    const eth = '2';
    const test = ujoLicensing.License(cid, oracle, buyer, beneficiaries, amounts, [], eth);
    console.log(test);
  });
});
