import ujoInit from '../../config';
import initializeLicensing from '..';

const keystore = require('./accounts');

describe('Licensing tests', async () => {
  const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs', { test: true });

  it('should create a license', async () => {
    const accounts = keystore.keys.map(({ address }) => address);
    const ujoLicensing = await initializeLicensing(ujoConfig);
    const cid = 'Qm';
    const buyer = '0xd287a4d332663312b541ee9bbcd522600d816d46';
    const beneficiaries = ['0x3249c9b7f3cc4d2d46bb6fd6d9e42a72b2001d03'];
    const amounts = ['2'];
    const eth = '2';
    const test = await ujoLicensing.License(cid, buyer, beneficiaries, amounts, [], eth);
    console.log(test);
  });
});
