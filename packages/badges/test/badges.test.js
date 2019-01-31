import ujoInit from '../../config';
import initializeBadges from '..';

// const keystore = require('./accounts');

describe('Badge tests', async () => {
  const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs');

  it('gets the exchange connects to the badge smart contract', async () => {
    const ujoBadges = await initializeBadges(ujoConfig, { test: true });
    console.log(ujoBadges);
  });
});
