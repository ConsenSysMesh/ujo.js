const ETHUSDHandler = artifacts.require('./ETHUSDHandler.sol');
const TestOracle = artifacts.require('./TestOracle.sol');

module.exports = (deployer, network) => {
  if (network === 'development') {
    deployer.deploy(TestOracle);
    deployer.deploy(ETHUSDHandler);
  }

  if (network === 'rinkeby') {
    deployer.deploy(ETHUSDHandler);
  }

  if (network === 'mainnet') {
    deployer.deploy(ETHUSDHandler);
  }
};
