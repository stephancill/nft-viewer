import { useEffect, useState } from "react"
import { Logo } from "../../components/Logo/Logo"
import style from "./Search.module.css"
import { ethers } from "ethers"
import { useNavigate } from "react-router"

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchEnabled, setSearchEnabled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setSearchEnabled(ethers.utils.isAddress(searchQuery.toLowerCase()) || (searchQuery.indexOf(".eth") > -1 && searchQuery.split(".eth")[1].length === 0))
  }, [searchQuery])

  return <div className={style.centerVertically}>
    <div className={style.col}>
      <div style={{textAlign: "center"}}><Logo withDescription={true}/></div>
      <div style={{width: "100%", marginTop: "30px"}}>
        <form onSubmit={async (e) => {
          e.preventDefault()
          navigate(`/port/${searchQuery}`)
        }}>
          <input onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search address or ENS" />
          <button className={style.searchButton} disabled={!searchEnabled} type="submit">🔎</button>
        </form>
      </div>
    </div>
  </div>

}