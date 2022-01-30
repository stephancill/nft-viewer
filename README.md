# ⚓️ Port - Digital Asset Viewer

## Local development
### Backend
```
FORK=mainnet npx hardhat node
```
```
FORK=mainnet npx hardhat deploy --export-all ../client/src/deployments.json --network localhost
```

### IPFS
Prerequisite: https://docs.ipfs.io/how-to/command-line-quick-start

Apply the [test profile](https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#profiles)
```
ipfs config profile apply test # TODO not working
```
```
ipfs daemon
```

### Client
```
yarn start
```

Connect to local node with chain ID 1.

## TODO

- [ ] Token lists
  - [x] Create
  - [x] Generate/sync from OpenSea/Etherscan
  - [x] Publish
  - [ ] Pinning
  - [x] Update
  - [ ] Default
    - [x] No tokens
    - [ ] Popular tokens
- [x] Contract
  - [x] Store URI to [token list](https://github.com/Uniswap/token-lists)
- [ ] Token types
  - [ ] Support ENS NFTs 
  - [ ] ERC1155
  - [x] ERC721