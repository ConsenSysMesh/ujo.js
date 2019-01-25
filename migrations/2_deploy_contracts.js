var ETHUSDHandler = artifacts.require('./ETHUSDHandler.sol');

module.exports = function(deployer) {
  deployer.deploy(ETHUSDHandler);
};
