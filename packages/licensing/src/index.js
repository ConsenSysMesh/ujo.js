import { boostGas, getContractAddress } from 'utils';
// import Truffle from 'truffle-contract';
import OracleContracts from 'ujo-contracts-oracle';
import LicensingContracts from '../../contracts/licensing/build/contracts/ETHUSDHandler.json';
import TestOracleContracts from '../../contracts/licensing/build/contracts/TestOracle.json';

/**
 * Initialize Licensing
 *
 * @param {Object} ujoConfig contains network configuration and optional propertiess
 */
export default async function initializeLicensing(ujoConfig, opts = {}) {
  const web3 = ujoConfig.getWeb3();
  const networkId = await ujoConfig.getNetwork();
  const licensingHandlerAddress = getContractAddress(LicensingContracts, networkId);
  const LicensingHandler = new web3.eth.Contract(LicensingContracts.abi, licensingHandlerAddress);

  let Oracle;
  if (opts.test) {
    const testOracleAddress = getContractAddress(TestOracleContracts, networkId);
    Oracle = new web3.eth.Contract(TestOracleContracts.abi, testOracleAddress);
  } else {
    const oracleAddress = getContractAddress(OracleContracts.USDETHOracle, networkId);
    Oracle = new web3.eth.Contract(OracleContracts.USDETHOracle.abi, oracleAddress);
  }

  return {
    getExchangeRate: async () => {
      const exchangeRate = await Oracle.methods.getUintPrice().call();
      return exchangeRate.toString(10);
    },
    License: async (cid, oracle, buyer, beneficiaries, amounts, notifiers, eth) => {
      console.log('License');

      let wei;
      if (eth) {
        wei = web3.utils.toWei(eth, 'ether');
      }

      // Convert ether amounts to wei
      const amountsInWei = amounts.map(amount => web3.utils.toWei(amount, 'ether'));

      console.log('++++++++++');
      console.log(LicensingHandler.methods);
      console.log(Oracle.address);
      console.log('++++++++++');

      const gasRequired = await LicensingHandler.methods
        .pay(
          cid,
          oracle, // which oracle to use for reference
          buyer, // address
          beneficiaries, // addresses
          amountsInWei, // in wei
          notifiers, // contract notifiers [none in this case]
        )
        .estimateGas({
          from: buyer,
          value: wei,
        });

      const gas = boostGas(gasRequired);

      return LicensingHandler.methods.pay(cid, oracle, buyer, beneficiaries, amountsInWei, []).send({
        from: buyer,
        value: wei,
        gas,
      });
    },
  };
}
