import { useState } from 'react'
import { ConnectButton } from '../ConnectButton/ConnectButton'
import { ConnectModal } from '../ConnectModal/ConnectModal'
import "./NavBar.css"

export const NavBar = () => {
  const [connecting, setConnecting] = useState(false)

  return <nav>
    <div style={{textAlign: "left", fontSize: "34px"}}>⚓️ Port</div>
    <div style={{marginLeft: "auto"}}><ConnectButton onConnect={() => setConnecting(true)}/></div>
    <ConnectModal setShouldShow={setConnecting} shouldShow={connecting} />
  </nav>
}