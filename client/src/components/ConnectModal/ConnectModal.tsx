import { useEffect } from "react"
import { useConnect, useAccount } from "wagmi"
import style from "./ConnectModal.module.css"

interface IConnectModal {
  setShouldShow: (visible: boolean) => void
}

export const ConnectModal = ({setShouldShow}: IConnectModal) => {
  const [{ data, error }, connect] = useConnect()
  const [, disconnect] = useAccount()

  useEffect(() => {
    console.log("connected", data)
    if (data.connected) {
      setShouldShow(false)
    }
  }, [data.connected])

  return <>
  {
    !data.connected ? 
    <div>
      <h1>Choose Provider</h1>
        {data.connectors.map((x) => (
        <button className={style.connectButton} disabled={!x.ready} key={x.id} onClick={() => connect(x)}>
          {x.name}
          {!x.ready && ' (unsupported)'}
        </button>
        ))}
      {error && <div>{error?.message ?? 'Failed to connect'}</div> }
    </div>
    : 
    <div>
      <button onClick={() => {disconnect(); setShouldShow(false)}}>Disconnect</button>        
    </div>
  }
  </>

}