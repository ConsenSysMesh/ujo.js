import ujoInit from '../../config';
import initializeBadges from '../../badges';

async function execute() {
  const ujoConfig = ujoInit('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
  // do not delete, will translate this into documentation
  const accounts = await ujoConfig.getAccounts();
  const network = await ujoConfig.getNetwork();
  const txReceipt = await ujoConfig.getTransactionReceipt(
    '0xc3ccf36047e8645210f7851d5f01766ba3e2fe5d63d1c034870ad35d589ad620',
  );
  // console.log('txReceipt', txReceipt);
  const ujoBadges = await initializeBadges(ujoConfig);
  const badges = await ujoBadges.getAllBadges();
  const badgesByAddress = await ujoBadges.getBadgesByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
  const badgeCheck = await ujoBadges.getBadge('0xc3ccf36047e8645210f7851d5f01766ba3e2fe5d63d1c034870ad35d589ad620');
}

execute();
