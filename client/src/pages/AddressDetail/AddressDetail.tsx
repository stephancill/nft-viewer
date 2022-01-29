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
  const provider = useProvider()
  const ipfs = useStartIPFS()
  const [{ data: signerData }] = useSigner()
  const [{ data: accountData }] = useAccount()
  const [user, setUser] = useState<IUser | null | undefined>(undefined)
  const [tokenList, setTokenList] = useState<TokenList | undefined>(undefined)
  const [canonicalTokenList, setCanonicalTokenList] = useState<TokenList | undefined>(undefined)
  const [items, setItems] = useState<Array<IAssetItem>>([])
  const [shouldShowTrackingModal, setShouldShowTrackingModal] = useState(false)
  const [shouldShowOverrideModal, setShouldShowOverrideModal] = useState(false)
  const [overrideURN, setOverrideURN] = useState("")
  const directoryContract = useContract<DirectoryContract>({
    addressOrName: deployments["31337"]["localhost"].contracts["Directory"].address, // TODO: Use mainnet deployment
    contractInterface: deployments["31337"]["localhost"].contracts["Directory"].abi,
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
      await directoryContract.setList(`ipfs://${result.cid.toString()}`)
      
      // Force refresh
      setTokenList(undefined) 
    })()

  }

  useEffect(() => {
    (async () => {
      const searchQuery = params.searchQuery || ""
      if (user === undefined) {
        if (searchQuery.indexOf(".eth") > -1 && searchQuery.split(".eth")[1] === "") {
          const address = await provider.resolveName(searchQuery.toLowerCase())
          if (!address) {
            setUser(null)
          } else {
            setUser({
              address,
              displayName: searchQuery
            })
          }
          
        } else if (ethers.utils.isAddress(searchQuery.toLowerCase())) {
          const displayName = await provider.lookupAddress(searchQuery.toLowerCase())
          setUser({
            displayName,
            address: searchQuery
          })
        }
      }
    })()
  }, [])

  useEffect(() => {
    if (!tokenList && user) {
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
        const tokens = await Promise.all(tokenList!.tokens.map(token => {
          console.log(token.name)
          const tokenIds = listTokensOfOwner(token.address, user!.address, provider)
          return tokenIds
        }))
        console.log(tokens)
      })()
    }
  }, [tokenList])

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
            <button onClick={() => setShouldShowOverrideModal(true)}>Override</button>
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
            await directoryContract.setList(overrideURN)
          })()
        }}>Confirm</button>
      </div>
    }/>
  </div>
}
