const BadgesProxy = artifacts.require('./UjoPatronageBadges.sol');
const Functions = artifacts.require('./UjoPatronageBadgesFunctions.sol');

module.exports = (deployer, network, accounts) => {
  // currently this migration script only supports ganache
  if (network === 'development') {
    deployer
      .deploy(Functions)
      .then(deployedFunctions => deployer.deploy(BadgesProxy, accounts[0], deployedFunctions.address));
  }
};
