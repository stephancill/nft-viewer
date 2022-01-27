import { useEffect, useState } from "react"
import { Logo } from "../../components/Logo/Logo"
import "./Search.css"
import { ethers } from "ethers"
import { useNavigate } from "react-router"

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchEnabled, setSearchEnabled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setSearchEnabled(ethers.utils.isAddress(searchQuery.toLowerCase()) || (searchQuery.indexOf(".eth") > -1 && searchQuery.split(".eth")[1].length === 0))
  }, [searchQuery])

  return <div className="center-vertically">
    <div className="col">
      <Logo withDescription={true}/>
      
      <div style={{width: "100%", marginTop: "30px"}}>
        <form onSubmit={async (e) => {
          e.preventDefault()
          navigate(`/port/${searchQuery}`)
        }}>
          <input className="search-input" onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search address or ENS" />
          <button className="search-button" disabled={!searchEnabled} type="submit">🔎</button>
        </form>
      </div>
    </div>
  </div>

}