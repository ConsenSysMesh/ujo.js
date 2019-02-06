import { assert, expect } from 'chai';
import ujoInit from '../../config';
import initializeBadges from '..';
import { getContractAddress } from '../../utils/dist';
import { UjoPatronageBadges, UjoPatronageBadgesFunctions } from '../../contracts-badges';

/* make sure to start a new fresh instance of ganache before running the tests */
describe('initialize badges', () => {
  const ujoConfig = ujoInit('http://127.0.0.1:8545', 'ipfs', { test: true });

  it('returns a badge package object with 6 methods', async () => {
    const ujoBadges = await initializeBadges(ujoConfig);
    assert.isObject(ujoBadges, 'ujoBadges is supposed to be an object');
    assert.equal(Object.keys(ujoBadges).length, 6, 'ujoBadges should have 6 properties, all methods');
    expect(ujoBadges).to.have.all.keys([
      'getBadgeContract',
      'getAllBadges',
      'getBadgesOwnedByAddress',
      'getBadgesMintedFor',
      'getBadge',
      'buyBadge',
    ]);
  });

  xit('throws an error if an improperly formed ujoConfig object is passed', () => {});

  xit('throws an error if it cannot get the network id', () => {});

  xit('throws an error if developer is on an unsupported network');

  xit('throws an error if it cannot create an instance of the badge smart contract', () => {});

  describe('getBadgeContract', () => {
    let badgeContractFromBadgePackage;
    beforeEach(async () => {
      const { getBadgeContract } = await initializeBadges(ujoConfig);
      badgeContractFromBadgePackage = getBadgeContract();
    });

    it('returns the smart contract of the badge', async () => {
      const web3 = ujoConfig.getWeb3();
      const patronageBadgesProxyAddress = getContractAddress(UjoPatronageBadges, '1234');
      const patronageBadgeContract = new web3.eth.Contract(
        UjoPatronageBadgesFunctions.abi,
        patronageBadgesProxyAddress,
      );

      assert.isObject(badgeContractFromBadgePackage, 'should return an object');
      assert.equal(
        JSON.stringify(badgeContractFromBadgePackage),
        JSON.stringify(patronageBadgeContract),
        'badge contract improperly created or returned',
      );
    });

    xit('throws an error if no smart contract is found', () => {});
  });

  describe('getAllBadges', () => {
    let ujoBadges;
    beforeEach(async () => {
      ujoBadges = await initializeBadges(ujoConfig);
    });

    xit('returns an empty array when no badges exist', async () => {
      const noBadges = await ujoBadges.getAllBadges();
      assert(Array.isArray(noBadges), 'return value should be an array');
      assert.strictEqual(noBadges.length, 0, "there shouldn't be a badge in the contract");
    });

    it('returns an array of badges when badges exist', async () => {
      const badges = await ujoBadges.getAllBadges();
      const badgeCount = badges.length;
      const accounts = await ujoConfig.getAccounts();
      await ujoBadges.buyBadge(accounts[0], 'uniqueCid', [accounts[1]], [], 5);
      await ujoBadges.buyBadge(accounts[1], 'uniqueCid1', [accounts[2]], [], 5);
      const twoMoreBadges = await ujoBadges.getAllBadges();
      assert(Array.isArray(twoMoreBadges), 'return value should be an array');
      assert.strictEqual(twoMoreBadges.length, badgeCount + 2, 'wrong number of badges fetched');
    });

    it('returns an array where each badge is an array of 3 items', async () => {
      const [badge] = await ujoBadges.getAllBadges();
      assert(Array.isArray(badge), 'return value should be an array of badge arrays');
      assert.strictEqual(badge.length, 3, 'there should be three elements in each single badge array');
      assert.strictEqual(badge[0], 'uniqueCid', 'wrong badge returned');
    });

    xit('throws an error if it cant fetch the badges', async () => {});
  });

  describe('getBadgesOwnedByAddress', () => {
    let accounts;
    let ujoBadges;
    beforeEach(async () => {
      accounts = await ujoConfig.getAccounts();
      ujoBadges = await initializeBadges(ujoConfig);
    });

    it('returns an empty array if the address does not own any badges', async () => {
      const zeroBadges = await ujoBadges.getBadgesOwnedByAddress(accounts[9]);
      assert(Array.isArray(zeroBadges), 'return value should be an array');
      assert.strictEqual(zeroBadges.length, 0, 'no badges should have been returned');
    });

    it('returns an array where each badge is an array of 3 items', async () => {
      const [badge] = await ujoBadges.getBadgesOwnedByAddress(accounts[1]);
      assert(Array.isArray(badge), 'return value should be an array of badge arrays');
      assert.strictEqual(badge.length, 3, 'there should be three elements in each single badge array');
      assert.strictEqual(badge[0], 'uniqueCid', 'wrong badge returned');
    });

    it('returns the correct number of badges per owner', async () => {
      const badgesByAddress = await ujoBadges.getBadgesOwnedByAddress(accounts[0]);

      const badgeContract = ujoBadges.getBadgeContract();
      const tokensOwnedByAddress = await badgeContract.methods.getAllTokens(accounts[0]).call();

      assert.strictEqual(
        badgesByAddress.length,
        tokensOwnedByAddress.length,
        'wrong number of badges returned for address',
      );
    });

    xit('throws a helpful error message if there is an error fetching badges', async () => {});

    xit('throws an error if no address or an invalid address is passed as argument', async () => {});
  });

  describe('getBadgesMintedFor', () => {
    let ujoBadges;
    let accounts;
    beforeEach(async () => {
      ujoBadges = await initializeBadges(ujoConfig);
      accounts = await ujoConfig.getAccounts();
    });

    it('returns an empty array if the unique string does not have any badges minted', async () => {
      const zeroBadges = await ujoBadges.getBadgesMintedFor('xxxxxx');
      assert(Array.isArray(zeroBadges), 'return value should be an array');
      assert.strictEqual(zeroBadges.length, 0, 'no badges should have been returned');
    });

    it('returns the correct number of badges per unique string', async () => {
      const randomCid = Math.random()
        .toString(36)
        .substring(7);

      await ujoBadges.buyBadge(accounts[5], randomCid, [accounts[6]], [], 5);
      const singleBadge = await ujoBadges.getBadgesMintedFor(randomCid);
      assert(Array.isArray(singleBadge), 'return value should be an array');
      assert.strictEqual(singleBadge.length, 1, 'one badge should have been returned');
    });

    it('returns an empty array for falsey input values', async () => {
      const emptyString = await ujoBadges.getBadgesMintedFor('');
      const noArgument = await ujoBadges.getBadgesMintedFor();
      const nothing = await ujoBadges.getBadgesMintedFor(null);
      const zero = await ujoBadges.getBadgesMintedFor(0);

      assert(Array.isArray(emptyString), 'return value should be an array');
      assert.strictEqual(emptyString.length, 0, 'zero badges should have been returned');

      assert(Array.isArray(noArgument), 'return value should be an array');
      assert.strictEqual(noArgument.length, 0, 'zero badges should have been returned');

      assert(Array.isArray(nothing), 'return value should be an array');
      assert.strictEqual(nothing.length, 0, 'zero badges should have been returned');

      assert(Array.isArray(zero), 'return value should be an array');
      assert.strictEqual(zero.length, 0, 'zero badges should have been returned');
    });

    describe('getBadge', () => {
      let ujoBadges;
      beforeEach(async () => {
        ujoBadges = await initializeBadges(ujoConfig);
      });

      it('returns a web31.0 tx receipt', async () => {});

      it('returns null if transaction has not been mined', async () => {});

      it('returns the standardized badge data with the tx receipt', async () => {});

      it('throws an error if it cannot get the tx receipt', async () => {});
    });

    describe('buyBadge', () => {
      let ujoBadges;
      let accounts;
      beforeEach(async () => {
        ujoBadges = await initializeBadges(ujoConfig);
        accounts = await ujoConfig.getAccounts();
      });
    });
  });
});
