import style from "./TrackModal.module.css"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useProvider } from "wagmi"
import { TokenInfo } from "@uniswap/token-lists"
import { abi } from "../../abis/erc721"
import { parseURI } from "../../utils/parseURI"

interface ITrackModalProps {
  onAddToken: (token: TokenInfo) => void
}

export const TrackModal = ({onAddToken}: ITrackModalProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined)
  const [error, setError] = useState<string|null>(null)
  const provider = useProvider()

  useEffect(() => {
    if (ethers.utils.isAddress(searchQuery.toLowerCase()) || (searchQuery.indexOf(".eth") > -1 && searchQuery.split(".eth")[1].length === 0)) {
      (async () => {
        const erc721 = new ethers.Contract(searchQuery, abi, provider)
        let name = "undefined"
        let symbol = "undefined"
        let uri = "undefined"
        try {
          name = await erc721.name()
          symbol = await erc721.symbol()
          uri = await erc721.tokenURI(1)
        } catch (e) {
          // TODO: Throw error
          setError("Incompatible contract")
        }
        
        const src = await parseURI(uri)

        const tokenInfo: TokenInfo = {
          address: ethers.utils.getAddress(searchQuery.toLowerCase()),
          chainId: provider.network.chainId,
          decimals: 0,
          name: name,
          symbol: symbol,
          logoURI: src
        }
        setTokenInfo(tokenInfo)
      })()
    } else {
      setError(null)
      setTokenInfo(undefined)
    }
  }, [searchQuery, provider])

  return <div>
    <div className={style.heading}>Add Collection</div>
    <input className={style.searchInput} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search address or ENS" />
    {tokenInfo && !error ? 
    <div>
      {/* https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs */}
      <img src={tokenInfo.logoURI} alt="" />
      {tokenInfo.name} {tokenInfo.symbol}
      <button onClick={() => onAddToken(tokenInfo)}>Add</button>
    </div>
    : 
    <></>}
    {error ? <div>{error}</div> : <></>}
  </div>
}