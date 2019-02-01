import { TestOracle } from '../../oracle/contracts/TestOracle.sol';
import { getContractAddress } from '../../../utils/dist';

const BadgesProxy = artifacts.require('./UjoPatronageBadges.sol');
const Functions = artifacts.require('./UjoPatronageBadgesFunctions.sol');

module.exports = (deployer, network, accounts) => {
  // currently this migration script only supports ganache
  if (network === 'development') {
    deployer
      .deploy(Functions)
      .then(deployedFunctions => deployer.deploy(BadgesProxy, accounts[0], deployedFunctions.address))
      .then(deployedProxy => Functions.at(deployedProxy.address))
      .then(deployedBadgesProxy => {
        const testOracleAddress = getContractAddress(TestOracle, '1234');
        return deployedBadgesProxy.setupBadges('0x0', testOracleAddress);
      });
  }
};
