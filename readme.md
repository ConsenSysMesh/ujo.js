For developers:

_FROM THE ROOT DIRECTORY_:

remove all node modules (if you already have them installed):
`lerna clean`

install all dependencies in the root and each sub-package
`lerna bootstrap --hoist`

build all the javascript source
`npm run build`

Compile contracts:

(needs improvement)
`cd` into each `contracts-` directory and run `truffle compile`

(need a script that injects correct network information into compiled JSON contracts for rinkeby and mainnet)

to run on ganache:

make sure you have a ganache instance running on port 8545 and then run:
`truffle migrate`
