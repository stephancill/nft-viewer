import Ajv from 'ajv'
import addFormats from "ajv-formats"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useAccount, useContract, useProvider, useSigner } from "wagmi"
import { truncateAddress } from "../../utilities"
import { IAssetItem } from "../../components/AssetItem/AssetItem"
import style from "./AddressDetail.module.css"
import { TrackModal } from "../../components/TrackModal/TrackModal"
import { GenericModal } from "../../components/GenericModal/GenericModal"
import { AssetItemGrid } from "../../components/AssetItemGrid/AssetItemGrid"
import { TokenList, TokenInfo, schema } from "@uniswap/token-lists"
import { Directory as DirectoryContract } from "../../../../backend/types"
import { useDeployments } from "../../hooks/useDeployments"
import { listTokensOfOwner } from '../../utils/tokenIdsByAddress'
import { useStartIPFS } from '../../hooks/useStartIPFS'
import { abi } from '../../abis/erc721'
import { parseURI } from '../../utils/parseURI'
import { ImportTokensModal } from '../../components/ImportTokensModal/ImportTokensModal'

interface IUser {
  address: string
  displayName: string | null
}

const defaultTokenList: TokenList = {
  name: "Port List",
  timestamp: (new Date()).toISOString(),
  tokens: [],
  version: {
    major: 1,
    minor: 0,
    patch: 0
  }
}

const ajv = new Ajv({ allErrors: true });
addFormats(ajv)
const validate = ajv.compile(schema);

export const AddressDetail = () => {
  const deployments = useDeployments()
  const params = useParams()
  const ipfs = useStartIPFS()
  const [{ data: signerData }] = useSigner()
  const [{ data: accountData }] = useAccount()
  const [user, setUser] = useState<IUser | null | undefined>(undefined)
  const [tokenList, setTokenList] = useState<TokenList | undefined>(undefined)
  const [canonicalTokenList, setCanonicalTokenList] = useState<TokenList | undefined>(undefined)
  const [items, setItems] = useState<Array<IAssetItem>>([])
  const [shouldShowTrackingModal, setShouldShowTrackingModal] = useState(false)
  const [shouldShowRemoveTokens, setShouldShowRemoveTokens] = useState(false)
  const [shouldShowOverrideModal, setShouldShowOverrideModal] = useState(false)
  const [shouldShowImportModal, setShouldShowImportModal] = useState(false)
  const [overrideURN, setOverrideURN] = useState("")
  const directoryContract = useContract<DirectoryContract>({
    addressOrName: deployments["1"]["localhost"].contracts["Directory"].address, // TODO: Use mainnet deployment
    contractInterface: deployments["1"]["localhost"].contracts["Directory"].abi,
    signerOrProvider: signerData
  })


  const onAddToken = (token: TokenInfo) => {
    const newTokenList = {...tokenList!}
    if (tokenList?.tokens.filter(_token => _token.address === token.address).length === 0) {
      newTokenList!.tokens.push(token)
      if (canonicalTokenList) {
        newTokenList!.version = {
          ...canonicalTokenList.version,
          patch: canonicalTokenList.version.patch + 1,
        }
      }
    }
    setShouldShowTrackingModal(false)
    setTokenList(newTokenList)
  }
  
  const onRemoveToken = (token: TokenInfo) => {
    const newTokenList: TokenList = {
      ...tokenList!,
      tokens: tokenList!.tokens.filter(_token => _token.address !== token.address),
      version: canonicalTokenList? {
        ...canonicalTokenList.version,
        patch: canonicalTokenList.version.patch + 1,
      } : tokenList!.version
    }
    
    setShouldShowTrackingModal(false)
    setTokenList(newTokenList)
  } 

  const onImportTokens = (tokens: Array<TokenInfo>) => {
    const tokensToAdd: Array<TokenInfo> = []
    tokens.forEach(token => {
      if (tokenList?.tokens.filter(_token => _token.address === token.address).length === 0) {
        tokensToAdd.push(token)
      }
    })
    setTokenList({
      ...tokenList!, 
      tokens: [...tokenList!.tokens, ...tokensToAdd],
      version: canonicalTokenList? {
        ...canonicalTokenList.version,
        patch: canonicalTokenList.version.patch + 1,
      } : tokenList!.version
    })
    setShouldShowImportModal(false)
  }

  const publishTokenList = (tokenList: TokenList) => {
    // Publish to IPFS
    if (!ipfs) {
      console.error("no ipfs")
      // TODO: Handle this
      return
    }
    const data = JSON.stringify(tokenList);

    (async () => {
      const result = await ipfs.add(data)
      // Store hash on-chain
      try {
        const tx = await directoryContract.setList(`ipfs://${result.cid.toString()}`)
        await tx.wait()
        // Force refresh
        setTokenList(undefined) 
      } catch (error) {}
    })()

  }

  useEffect(() => {
    if (!signerData || (signerData && signerData.provider === undefined)) return
    (async () => {
      const searchQuery = params.searchQuery || ""
      if (user === undefined) {
        if (searchQuery.indexOf(".eth") > -1 && searchQuery.split(".eth")[1] === "") {
          const address = await signerData!.provider!.resolveName(searchQuery.toLowerCase())
          if (!address) {
            setUser(null)
          } else {
            setUser({
              address,
              displayName: searchQuery
            })
          }
          
        } else if (ethers.utils.isAddress(searchQuery.toLowerCase())) {
          const displayName = await signerData!.provider!.lookupAddress(searchQuery.toLowerCase())
          setUser({
            displayName,
            address: searchQuery
          })
        }
      }
    })()
  }, [signerData])

  useEffect(() => {
    if (!tokenList && user && signerData) {
      (async () => {
        const uri = await directoryContract.listURIs(user!.address)
        if (uri.length === 0) {
          setTokenList(defaultTokenList)
          return
        }
        // const uri = "ipfs://bafybeicnzgdsfgsytddeibvvw7ha7t72jknzfjdlawf6e5xntal7p6u3je"
        console.log(uri)
        if (uri.length > 0) {
          let tokenListJson: JSON
          if (uri.indexOf("ipfs://") === 0 && ipfs) {
            const stream = ipfs.cat(uri.split("ipfs://")[1])
            let data = ""

            for await (const chunk of stream) {
              data += Buffer.from(chunk).toString('utf-8')
            }
            try {
              tokenListJson = JSON.parse(data)
            } catch(_) {
              tokenListJson = JSON.parse("{}")
              // TODO: Handle invalid JSON
            }
            
          } else {
            const response = await fetch(uri)
            tokenListJson = await response.json()
          }
          
          const valid = validate(tokenListJson)
          if (valid) {
            setTokenList(tokenListJson as unknown as TokenList)
            setCanonicalTokenList(tokenListJson as unknown as TokenList)
          }
        }
      })()
    }
  }, [user, tokenList, directoryContract, ipfs])

  useEffect(() => {
    console.log("updated tokenlist")
    if (tokenList) {
      console.log(tokenList);
      (async () => {
        const tokenIds = await Promise.all(tokenList!.tokens.map(token => {
          const tokenIds = listTokensOfOwner(token.address, user!.address, signerData!.provider!)
          return tokenIds
        }))
        console.log(tokenIds)
        const nestedTokenURIs: Array<Array<string>> = await Promise.all(tokenList!.tokens.map((token, index) => {
          const erc721Contract = new ethers.Contract(token.address, abi, signerData)
          const ownedIds = tokenIds[index]
          const tokenURIs = Promise.all(ownedIds.map(tokenId => {
            return erc721Contract.tokenURI(tokenId) 
          }))
          return tokenURIs
        }))

        const assets: Array<IAssetItem> = []
        await Promise.all(nestedTokenURIs.map(async (tokenURIs, index) => {
          return await Promise.all(tokenURIs.map(async (tokenURI, _index) => {
            const src = await parseURI(tokenURI)
            assets.push({
              tokenInfo: tokenList!.tokens[index],
              tokenId: tokenIds[index][_index],
              src
            })
          }))
        }))
        console.log("Fetched assets")
        setItems(assets)
      })()
    }
  }, [tokenList])

  if (!signerData) {
    return <div>Connect wallet to continue</div>
  }

  return <div>
    {user ? <>
      <div className={style.heading}>
        {user.displayName || truncateAddress(user.address)}
      </div>
      {user.displayName ? 
        <div className={style.subheading}>
          {truncateAddress(user.address)}
        </div> : <></>
      }
      <div style={{marginTop: "20px", fontSize: "18px"}}>
        <div>Tracking {items.length} item{items.length === 1 ? "" : "s"} across {tokenList?.tokens.length || 0} collection{(tokenList?.tokens.length || 2) === 1 ? "" : "s"}</div>
        {user.address === accountData?.address ? 
          <div>
            <button onClick={() => setShouldShowTrackingModal(true)}>Add</button>
            {tokenList && tokenList!.tokens.length > 0 ? 
              !canonicalTokenList ?
                <button onClick={() => publishTokenList(tokenList!)}>Publish</button> 
              : 
                canonicalTokenList.version !== tokenList!.version ? 
                  <button onClick={() => publishTokenList(tokenList!)}>Update</button> 
                : <></> 
            : <></>
            }
            {tokenList && tokenList!.tokens.length > 0 ? 
              <button onClick={() => setShouldShowRemoveTokens(true)}>Remove</button>
              : <></>
            }
            <button onClick={() => setShouldShowOverrideModal(true)}>Override</button>
            <button onClick={() => setShouldShowImportModal(true)}>Import</button>
          </div> 
          : <></>
        }
        
      </div>
      <div style={{marginTop: "20px"}}>
        {/* TODO: Display items */}
        <AssetItemGrid items={items} />
      </div>
      </>
    : user === undefined ? <div>Loading...</div> : <div>{params.searchQuery} not found</div>
    }
    <GenericModal setShouldShow={setShouldShowTrackingModal} shouldShow={shouldShowTrackingModal} content={
      <TrackModal onAddToken={onAddToken}/>
    }/>
    <GenericModal setShouldShow={setShouldShowOverrideModal} shouldShow={shouldShowOverrideModal} content={
      <div>
        <input type="text" value={overrideURN} placeholder="Override list URN" onChange={(e) => setOverrideURN(e.target.value)}/>
        <button onClick={() => {
          (async () => {
            console.log(overrideURN)
            try {
              const tx = await directoryContract.setList(overrideURN)
              await tx.wait()
            } catch (error) {}
            
          })()
        }}>Confirm</button>
      </div>
    }/>
    <GenericModal setShouldShow={setShouldShowRemoveTokens} shouldShow={shouldShowRemoveTokens} content={
      <div>
        {
          tokenList?.tokens.map(token => <div key={token.address}>
            <button onClick={() => onRemoveToken(token)}>{token.name}</button>
          </div>)
        }
      </div>
    }/>

    <GenericModal setShouldShow={setShouldShowImportModal} shouldShow={shouldShowImportModal} content={
      <ImportTokensModal onImport={onImportTokens}/>
    }/>

  </div>
}
