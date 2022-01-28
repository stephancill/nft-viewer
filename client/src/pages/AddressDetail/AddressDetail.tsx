import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useProvider } from "wagmi"
import { truncateAddress } from "../../utilities"
import { IAssetItem } from "../../components/AssetItem/AssetItem"
import style from "./AddressDetail.module.css"
import { TrackModal } from "../../components/TrackModal/TrackModal"
import { GenericModal } from "../../components/GenericModal/GenericModal"
import { ICollection } from "../../interfaces/ICollection"
import { AssetItemGrid } from "../../components/AssetItemGrid/AssetItemGrid"
import { TokenList, TokenInfo } from "@uniswap/token-lists"

interface IUser {
  address: string
  displayName: string | null
}

export const AddressDetail = () => {
  const params = useParams()
  const provider = useProvider()
  const [user, setUser] = useState<IUser | null | undefined>(undefined)
  const [tokenList, setTokenList] = useState<TokenList | undefined>(undefined)
  const [items, setItems] = useState<Array<IAssetItem>>([])
  const [shouldShowTrackingModal, setShouldShowTrackingModal] = useState(false)

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
    if (!tokenList) {
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
        <div>
          <button onClick={() => setShouldShowTrackingModal(true)}>Add</button>
        </div>
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
