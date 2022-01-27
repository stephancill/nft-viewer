import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useProvider } from "wagmi"
import { truncateAddress } from "../../utilities"
import { AssetItem, IAssetItem } from "../../components/AssetItem/AssetItem"
import style from "./AddressDetail.module.css"

interface IUser {
  address: string
  displayName: string | null
}

interface ICollections {
  collectionName: string
  items: Array<IAssetItem>
}

export const AddressDetail = () => {
  const params = useParams()
  const provider = useProvider()
  const [user, setUser] = useState<IUser | null | undefined>(undefined)
  const [collections, setCollections] = useState<Array<ICollections>>([])
  const [items, setItems] = useState<Array<IAssetItem>>([])

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
    if (collections.length === 0) {
      const allItems: Array<IAssetItem> = []
      const collections: Array<ICollections> = [...new Array(10)].map((_, i) => {
        const collectionName = `Collection ${i}`
        return {
          collectionName,
          items: [...new Array(2)].map((_, i) => {
            const item = {
              src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ThreeTimeAKCGoldWinnerPembrookeWelshCorgi.jpg/1920px-ThreeTimeAKCGoldWinnerPembrookeWelshCorgi.jpg",
              tokenId: i+1,
              collectionName: collectionName,
              address: "0xCC78016816633528Dd4918746D7F016563Ce27FA"
            }
            allItems.push(item)
            return item
          })
        }
      });
      setCollections(collections)
      setItems(allItems)
    }
  }, [])



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
        <div>Tracking {items.length} item{items.length > 1 ? "s" : ""} across {collections.length} collection{collections.length > 1 ? "s" : ""}</div>
      </div>
      <div style={{marginTop: "20px"}}>
        {[...new Array(items.length)].map((_, index) => {
          return <AssetItem style={{marginRight: "15px", marginBottom: "15px"}} key={index} {...items[index]}/>
        })}
      </div>
      </>
    : user === undefined ? <div>Loading...</div> : <div>{params.searchQuery} not found</div>
    }
  </div>
}
