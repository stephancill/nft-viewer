import { useState } from 'react'
import { Logo } from '../Logo/Logo'
import { ConnectButton } from '../ConnectButton/ConnectButton'
import { ConnectModal } from '../ConnectModal/ConnectModal'
import "./NavBar.module.css"

export const NavBar = () => {
  const [connecting, setConnecting] = useState(false)

  return <nav>
    <div style={{textAlign: "left"}}><a style={{textDecoration: "none", color: "black"}} href='/'><Logo/></a> </div>
    <div style={{marginLeft: "auto"}}><ConnectButton onConnect={() => setConnecting(true)}/></div>
    <ConnectModal setShouldShow={setConnecting} shouldShow={connecting} />
  </nav>
}