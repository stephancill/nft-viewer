# ⚓️ Port - Digital Asset Viewer

## Local development
### Backend
```
npx hardhat node
```
```
npx hardhat deploy --export-all ../client/deployments.json --network localhost
```

### Client
```
yarn start
```

## TODO

- [ ] Token lists
  - [ ] Create
  - [ ] Publish
  - [ ] Update
  - [ ] Default
- [x] Contract
  - [x] Store URI to [token list](https://github.com/Uniswap/token-lists)