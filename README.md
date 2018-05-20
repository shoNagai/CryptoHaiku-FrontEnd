# CryptoHaiku

> CryptoHaiku is a new form of Japanese culture Haiku using blockchains

# technology
ERC721 + IPFS (Solidity + web3.js + truffle + nuxt.js)

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

## Setup firebase environment

``` bash

$ direnv edit .

# Please register to firebase and paste the setting
export APIKEY=
export AUTHDOMAIN=
export DATABASEURL=
export PROJECTID=
export STORAGEBUCKET=
export MESSAGINGSENDERID=

# Please paste the ipfs parameters
export IPFSHOST=
export IPFSPORT=
export IPFSPROTOCOL=

# Please edit the deploy env
export TXURL=export TXURL=https://rinkeby.etherscan.io/tx/
export NETWORKID=4
```

## Truffle Setup

``` bash
# deploy ganache localhost
truffle migrate --network dev

```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).
