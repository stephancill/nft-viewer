import { HardhatUserConfig, task } from "hardhat/config"
import '@typechain/hardhat'
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
}

export default config
