import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useProvider } from "wagmi"
import { truncateAddress } from "../../utilities"
import "./AddressDetail.css"

interface IUser {
  address: string
  displayName: string | null
}

export const AddressDetail = () => {
  const params = useParams()
  const provider = useProvider()
  const [user, setUser] = useState<IUser | null | undefined>(undefined)

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

  return <div>
    {user ? <>
      <div className="heading">
        {user.displayName || truncateAddress(user.address)}
      </div>
      {user.displayName ? 
        <div className="subheading">
          {truncateAddress(user.address)}
        </div> : <></>
      }
      </>
    : user === undefined ? <div>Loading...</div> : <div>{params.searchQuery} not found</div>
    }
    </div>
}