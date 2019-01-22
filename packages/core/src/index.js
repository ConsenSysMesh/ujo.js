import ujoInit from '../../config';
import initializeBadges from '../../badges';
import initializeLicensing from '../../licensing';

async function execute() {
  const ujoConfig = ujoInit('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
  // const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');
  // do not delete, will translate this into documentation
  const accounts = await ujoConfig.getAccounts();
  const network = await ujoConfig.getNetwork();

  // const ujoBadges = await initializeBadges(ujoConfig);
  // const badges = await ujoBadges.getBadgesByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
  // console.log(badges);

  const ujoLicensing = await initializeLicensing(ujoConfig);
  const exchangeRate = await ujoLicensing.getExchangeRate();
  console.log(exchangeRate);

  // sender, cid, beneficiaries, amounts, eth;
  await ujoLicensing.License('0x', 'Qm', ['0x'], [1], 1);
}

execute();
