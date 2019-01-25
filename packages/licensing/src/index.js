import Web3 from 'web3';
import Truffle from 'truffle-contract';
// import LicensingContracts from 'ujo-contracts-handlers';
import TestLicensingContracts from '../build/contracts/ETHUSDHandler.json';
import TestOracleContracts from '../build/contracts/TestOracle.json';
// import OracleContracts from 'ujo-contracts-oracle';

/**
 * Initialize Licensing
 *
 * @param {Object} ujoConfig contains network configuration and optional propertiess
 */
export default async function initializeLicensing(ujoConfig) {
  const web3 = ujoConfig.getWeb3();
  const web3Provider = web3.currentProvider;

  let LicensingContract = null;
  const LicensingHandler = Truffle(TestLicensingContracts);

  let OracleContract = null;
  // const Oracle = Truffle(OracleContracts.USDETHOracle);
  const Oracle = Truffle(TestOracleContracts);

  try {
    await LicensingHandler.setProvider(web3Provider);
    LicensingContract = await LicensingHandler.deployed();
  } catch (error) {
    console.log('Error connecting to licensing contract', error);
  }

  // TODO: Move to seperate oracle module
  try {
    await Oracle.setProvider(web3Provider);
    OracleContract = await Oracle.deployed();
  } catch (error) {
    console.log('Error connecting to oracle contract', error);
  }

  /**
   * Adds a 5% boost to the gas for web3 calls as to ensure tx's go through
   *
   * @param {string} gasRequired amount of gas required from `estimateGas`
   */
  const boostGas = gasRequired => {
    const { BN } = Web3.utils;
    const gasBoost = new BN(gasRequired, 10).divRound(new BN('20'));
    return new BN(gasRequired, 10).add(gasBoost);
  };

  return {
    getLicensingContract: () => LicensingContract,
    getExchangeRate: async () => {
      const oracleDeployed = await Oracle.deployed();
      const exchangeRate = await oracleDeployed.getUintPrice.call();
      return exchangeRate.toString(10);
    },
    License: async (sender, cid, beneficiaries, amounts, eth) => {
      console.log('License');
      let wei;
      if (eth) {
        wei = web3.utils.toWei(eth, 'ether');
      }

      // Convert ether amounts to wei
      const amountsInWei = amounts.map(amount => web3.utils.toWei(amount, 'ether'));

      const gasRequired = await LicensingContract.pay.estimateGas(
        cid,
        OracleContract.address, // which oracle to use for reference
        sender, // address
        beneficiaries, // addresses
        amountsInWei, // in wei
        [], // contract notifiers [none in this case]
        { from: sender, value: wei },
      );

      const gas = boostGas(gasRequired);

      return LicensingContract.pay(cid, OracleContract.address, sender, beneficiaries, amountsInWei, [], {
        from: sender,
        value: wei,
        gas,
      });
    },
  };
}
