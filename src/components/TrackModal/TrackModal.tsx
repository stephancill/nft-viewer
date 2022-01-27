import style from "./TrackModal.module.css"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { ICollection } from "../../interfaces/ICollection"
import { useContractRead, useProvider } from "wagmi"

const abi = [
  "function name() view returns (string memory)",
  "function symbol() view returns (string memory)",
  "function tokenURI(uint) view returns (string memory)"
];

interface IThumbnailCollection extends ICollection {
  srcThumbnail: string
}

export const TrackModal = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [collection, setCollection] = useState<IThumbnailCollection | undefined>(undefined)
  const provider = useProvider()

  useEffect(() => {
    if (ethers.utils.isAddress(searchQuery.toLowerCase()) || (searchQuery.indexOf(".eth") > -1 && searchQuery.split(".eth")[1].length === 0)) {
      (async () => {
        const erc721 = new ethers.Contract(searchQuery, abi, provider)
        const name = await erc721.name()
        const uri = await erc721.tokenURI(1)
        let src: string = uri
        if (uri.indexOf("data:application/json;base64,") === 0) {
          console.log(uri.split("data:application/json;base64,")[1])
          src = JSON.parse(atob(uri.split("data:application/json;base64,")[1])).image
        } else if (uri.indexOf("ipfs://") === 0) {
          const response = await fetch(`https://ipfs.io/ipfs/${uri.split("ipfs://")[1]}`)
          const json = await response.json()
          src = json.image
        } else if (uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0) {
          const response = await fetch(uri)
          const json = await response.json()
          src = json.image
        } else {
          // TODO: No image found image
        }

        if (src.indexOf("ipfs://") === 0) {
          src = `https://ipfs.io/ipfs/${src.split("ipfs://")[1]}`
        }

        const collection: IThumbnailCollection = {
          address: searchQuery.toLowerCase(),
          collectionName: name,
          srcThumbnail: src
        }
        setCollection(collection)
      })()
    }
  }, [searchQuery])

  return <div>
    <div className={style.heading}>Add Collection</div>
    <input className={style.searchInput} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search address or ENS" />
    {collection ? 
    <div>
      {/* https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs */}
      <img src={collection.srcThumbnail} alt="" />
      {collection.collectionName}
    </div>
    : 
    <></>}
  </div>
}