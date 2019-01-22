import Web3 from 'web3';
import Truffle from 'truffle-contract';
import LicensingContracts from 'ujo-contracts-handlers';
import OracleContracts from 'ujo-contracts-oracle';

/**
 * Initialize Licensing
 *
 * @param {Object} ujoConfig contains network configuration and optional propertiess
 */
export default async function initializeLicensing(ujoConfig) {
  const web3 = ujoConfig.getWeb3();
  const web3Provider = web3.currentProvider;

  let LicensingContract = null;
  const LicensingHandler = Truffle(LicensingContracts.ETHUSDHandler);

  let OracleContract = null;
  const Oracle = Truffle(OracleContracts.USDETHOracle);

  try {
    LicensingHandler.setProvider(web3Provider);
    LicensingContract = await LicensingHandler.deployed();
  } catch (error) {
    console.error('Error connecting to licensing contract');
  }

  // TODO: Move to seperate oracle module
  try {
    Oracle.setProvider(web3Provider);
    OracleContract = await Oracle.deployed();
  } catch (error) {
    console.error('Error connecting to oracle contract');
  }

  /**
   * Adds a 5% boost to the gas for web3 calls as to ensure tx's go through
   *
   * @param {string} gasRequired amount of gas required from `estimateGas`
   */
  const boostGas = gasRequired => {
    const { BN } = Web3.utils;
    const gasBoost = new BN(gasRequired, 10).divRound(new BN('20'));
    return new Web3(gasRequired, 10).add(gasBoost);
  };

  return {
    getLicensingContract: () => LicensingContract,
    getExchangeRate: async () => {
      const oracleDeployed = await Oracle.deployed();
      const exchangeRate = await oracleDeployed.getUintPrice.call();
      return exchangeRate.toString(10);
    },
    License: async (sender, cid, beneficiaries, amounts, eth) => {
      let wei;
      if (eth) {
        wei = web3.utils.toWei(eth, 'ether');
      }

      for (let amount of amounts) {
        amount = web3.utils.toWei(amount, 'ether');
      }

      const gasRequired = await LicensingContract.pay.estimateGas(
        cid,
        OracleContract.address, // which oracle to use for reference
        sender, // address
        beneficiaries, // addresses
        amounts,
        [], // contract notifiers [none in this case]
        { from: sender, value: wei },
      );

      console.log('+++++++++++++++');
      console.log(gasRequired);
      console.log('+++++++++++++++');
      const gas = boostGas(gasRequired);

      let output;
      try {
        LicensingContract.pay(cid, OracleContract.address, sender, beneficiaries, amounts, [], {
          from: sender,
          value: wei,
          gas,
        })
          .on('transactionHash', txHash => {
            console.log(txHash);
            output = txHash;
          })
          .on('receipt', txReceipt => {
            console.log(txReceipt);
            output = txReceipt;
          })
          .on('error', (error, receipt) => {
            console.log(error, receipt);
            output = error;
          });
      } catch (error) {
        return new Error({ error: 'Error licensing' });
      }

      // TODO: Fix return
      return output;
    },
  };
}
