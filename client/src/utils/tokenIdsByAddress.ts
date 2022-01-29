import { ethers } from "ethers"
import { abi } from "../abis/erc721"

function addressEqual(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

interface ITransferEventArgs {
  from: string,
  to: string,
  tokenId: number
}

// Source: https://github.com/frangio/erc721-list/blob/master/list.js
export async function listTokensOfOwner(tokenAddress: string, account: string, provider: ethers.providers.BaseProvider) {
  const token = new ethers.Contract(
    tokenAddress,
    abi,
    provider
  )

  const sentLogs = await token.queryFilter(
    token.filters.Transfer(account, null),
  )
  const receivedLogs = await token.queryFilter(
    token.filters.Transfer(null, account),
  )

  const logs = sentLogs.concat(receivedLogs)
    .sort(
      (a, b) =>
        a.blockNumber - b.blockNumber ||
        a.transactionIndex - b.transactionIndex,
    )

  const owned = new Set()

  logs.forEach(log => {
    const args = log.args as unknown as ITransferEventArgs
    const { from, to, tokenId } = args 
    if (addressEqual(to, account)) {
      owned.add(tokenId.toString())
    } else if (addressEqual(from, account)) {
      owned.delete(tokenId.toString())
    }
  })

  return owned
}