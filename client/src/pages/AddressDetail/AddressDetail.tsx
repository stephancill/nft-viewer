import Ajv from 'ajv'
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useAccount, useContract, useProvider, useSigner } from "wagmi"
import { truncateAddress } from "../../utilities"
import { IAssetItem } from "../../components/AssetItem/AssetItem"
import style from "./AddressDetail.module.css"
import { TrackModal } from "../../components/TrackModal/TrackModal"
import { GenericModal } from "../../components/GenericModal/GenericModal"
import { ICollection } from "../../interfaces/ICollection"
import { AssetItemGrid } from "../../components/AssetItemGrid/AssetItemGrid"
import { TokenList, TokenInfo, schema } from "@uniswap/token-lists"
import { Directory as DirectoryContract } from "../../../../backend/types"
import { useDeployments } from "../../hooks/useDeployments"
import * as IPFS from 'ipfs-core'

interface IUser {
  address: string
  displayName: string | null
}

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

export const AddressDetail = () => {
  const deployments = useDeployments()
  const params = useParams()
  const provider = useProvider()
  const [{ data: signerData }, getSigner] = useSigner()
  const [{ data: accountData }] = useAccount()
  const [user, setUser] = useState<IUser | null | undefined>(undefined)
  const [tokenList, setTokenList] = useState<TokenList | undefined>(undefined)
  const [items, setItems] = useState<Array<IAssetItem>>([])
  const [shouldShowTrackingModal, setShouldShowTrackingModal] = useState(false)
  const directoryContract = useContract<DirectoryContract>({
    addressOrName: deployments["31337"]["localhost"].contracts["Directory"].address,
    contractInterface: deployments["31337"]["localhost"].contracts["Directory"].abi,
    signerOrProvider: signerData
  })

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
        if (uri.length > 0) {
          let tokenListJson: JSON
          if (uri.indexOf("ipfs://") === 0) {
            const node = await IPFS.create()

            const stream = node.cat('QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A')
            let data = ''

            for await (const chunk of stream) {
              // chunks of data are returned as a Buffer, convert it back to a string
              data += chunk.toString()
            }
            tokenListJson = JSON.parse(data)
          } else {
            const response = await fetch(uri)
            tokenListJson = await response.json()
          }
          
          const valid = validate(tokenListJson)
          if (valid) {
            setTokenList(tokenListJson as unknown as TokenList) // TODO: Test this
          }

        }
      })()
      
      // TODO: Get token list
    }
  }, [user])

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
        <div>Tracking {items.length} item{items.length > 1 ? "s" : ""} across {tokenList?.tokens.length || 0} collection{tokenList?.tokens.length || 2 > 1 ? "s" : ""}</div>
        {user.address == accountData?.address ? 
          <div>
            <button onClick={() => setShouldShowTrackingModal(true)}>Add</button>
          </div> 
          : <></>
        }
        
      </div>
      <div style={{marginTop: "20px"}}>
        <AssetItemGrid items={items} />
      </div>
      </>
    : user === undefined ? <div>Loading...</div> : <div>{params.searchQuery} not found</div>
    }
    <GenericModal setShouldShow={setShouldShowTrackingModal} shouldShow={shouldShowTrackingModal} content={
      <TrackModal/>
    }></GenericModal>
  </div>
}
