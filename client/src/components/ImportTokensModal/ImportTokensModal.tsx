import { TokenInfo } from "@uniswap/token-lists"
import { useState } from "react"
import { useAccount } from "wagmi"
import { IUser } from "../../interfaces/IUser"
import style from "./ImportTokensModal.module.css"

interface IMoralisRequest {
  address: string
  chain: string
  method: string
}

interface MoralisToken {
  token_address: string
  amount: number
  name: string
  symbol: string
  is_valid: number
  contract_type: string,
  token_uri: string
}

interface IImportTokensModalProps {
  onImport: (tokens: Array<TokenInfo>) => void
  user: IUser
}

function formatMoralisRequest({address, chain, method}: IMoralisRequest): string {
  return `https://deep-index.moralis.io/api/v2/${address}/${method}?format=decimal&chain=${chain}`
}

export const ImportTokensModal = ({onImport, user}: IImportTokensModalProps) => {
  const [{ data: accountData, loading }] = useAccount()
  const [tokens, setTokens] = useState<Array<TokenInfo>>([])

  const onSync = async () => {
    const headers = new Headers()
    headers.append("X-API-Key", process.env.REACT_APP_MORALIS_API_KEY!)
    const res = await fetch(formatMoralisRequest({
      address: user.address,
      chain: "eth",
      method: "nft"
    }), {
      headers,
      method: "GET"
    })
    const json = await res.json() // TODO: Paging
    const rawTokens = json.result as Array<MoralisToken>
    const rawTokensAddressesSet = new Set<string>()
    const _tokens: Array<TokenInfo> = []
    rawTokens.forEach(token => {
      if (!rawTokensAddressesSet.has(token.token_address) && token.is_valid && token.contract_type === "ERC721") {
        rawTokensAddressesSet.add(token.token_address)
        _tokens.push({
          address: token.token_address,
          chainId: 1,
          decimals: 1,
          name: token.name,
          symbol: token.symbol,
          logoURI: token.token_uri
        })
      }
    })
    setTokens(_tokens)
  } 

  const onRemoveToken = (rawToken: TokenInfo) => {
    setTokens(tokens?.filter(token => token.address !== rawToken.address))
  }

  return <div style={{maxHeight: "50vh", overflow: "scroll"}}>
    <button onClick={() => onSync()}>Sync</button>
    {
      tokens.length > 0 ? 
      <div>
        <div className={style.heading}>Select Tokens</div>
        {tokens?.map(token => <div key={token.address}>
        <div>
            {token.name}
            <button onClick={() => onRemoveToken(token)}>Remove</button>
          </div>
        </div>)}
        <button onClick={() => onImport(tokens)}>Import</button>
      </div> : <></>
    }
    
    
  </div>
}