import { boostGas, getContractAddress } from '../../utils/dist';
import { ETHUSDHandler } from '../../contracts/licensing';

/**
 * Initialize Licensing
 *
 * @param {Object} ujoConfig contains network configuration and optional propertiess
 */
export default async function initializeLicensing(ujoConfig) {
  const web3 = ujoConfig.getWeb3();
  const networkId = await ujoConfig.getNetwork();
  const licensingHandlerAddress = getContractAddress(ETHUSDHandler, networkId);
  const LicensingHandler = new web3.eth.Contract(ETHUSDHandler.abi, licensingHandlerAddress);

  return {
    License: async (cid, buyer, beneficiaries, amounts, notifiers, eth) => {
      const oracleAddress = ujoConfig.getOracleAddress();
      let wei;
      if (eth) wei = web3.utils.toWei(eth, 'ether');

      // Convert ether amounts to wei
      const amountsInWei = amounts.map(amount => web3.utils.toWei(amount, 'ether'));

      const gasRequired = await LicensingHandler.methods
        .pay(
          cid,
          oracleAddress, // which oracle to use for reference
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

      return LicensingHandler.methods.pay(cid, oracleAddress, buyer, beneficiaries, amountsInWei, []).send({
        from: buyer,
        value: wei,
        gas,
      });
    },
  };
}
