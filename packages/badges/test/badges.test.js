import ujoInit from '../../config';
import initializeBadges from '..';


describe('Badge tests', () => {
  const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs', { test: true });

  it('connects to the badge smart contract', async () => {
    const ujoBadges = await initializeBadges(ujoConfig, { test: true });
    const accounts = await ujoConfig.getAccounts()
    const buyBadge = await ujoBadges.buyBadge(accounts[0], 'abc', [accounts[1]], [], 5)

    console.log(buyBadge);
  });
});
