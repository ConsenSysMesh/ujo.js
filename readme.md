For developers:

_FROM THE ROOT DIRECTORY_:

remove all node modules (if you already have them installed):
`lerna clean`

install all dependencies in the root and each sub-package
`lerna bootstrap --hoist`

build all the javascript source
`npm run build`

NOTE: the build command _must_ be run from the root directory right now, because the root directory's node modules has all the babel modules

This makes sense because you won't need to compile the code when `npm install`ing this single package (npm should host compiled code)

Starting a private ujo network with our smart contracts:

start a ganache-cli instance with networkID specified
`npm run private-chain`

compile && migrate contracts to private chain
`npm run private-ujo-network`

This `cd`s into each smart contract package, compiles the contracts, and then migrates them to the chain

`npm run clean-contracts` removes all the built smart contracts
