import { useEffect } from "react"
import { useConnect, useAccount } from "wagmi"
import style from "./ConnectModal.module.css"

interface IConnectModal {
  shouldShow: boolean
  setShouldShow: (visible: boolean) => void
}

export const ConnectModal = ({shouldShow, setShouldShow}: IConnectModal) => {
  const [{ data, error }, connect] = useConnect()
  const [, disconnect] = useAccount()

  useEffect(() => {
    console.log("connected", data)
    if (data.connected) {
      setShouldShow(false)
    }
  }, [data.connected])

  return <div style={{display: shouldShow ? "block" : "none"}}> 
    <div onClick={() => {setShouldShow(!shouldShow)}} style={{backgroundColor: "rgba(196, 196, 196, 0.74)", zIndex: "1"}} className="modal fullscreen"></div>
    <div className="fullscreen modal">
      <div className="container">
        {
        !data.connected ? 
        <div>
          <h1>Choose Provider</h1>
            {data.connectors.map((x) => (
            <button className="connect-button" disabled={!x.ready} key={x.id} onClick={() => connect(x)}>
              {x.name}
              {!x.ready && ' (unsupported)'}
            </button>
            ))}
          {error && <div>{error?.message ?? 'Failed to connect'}</div> }
        </div>
        : 
        <div>
          <button onClick={() => {disconnect(); setShouldShow(false)}}>Disconnect</button>        
        </div>}
      </div>
    </div>
  </div>
}