var ETHUSDHandler = artifacts.require('./ETHUSDHandler.sol');
var TestOracle = artifacts.require('./TestOracle.sol');

module.exports = function(deployer) {
  deployer.deploy(ETHUSDHandler);
  deployer.deploy(TestOracle);
};
