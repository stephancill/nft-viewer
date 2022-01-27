import { useAccount } from 'wagmi'
import "./ConnectButton.css"
import {truncateAddress} from "./../../utilities"

interface IConnectButtonProps {
  onConnect: () => void
}


export const ConnectButton = ({onConnect}: IConnectButtonProps) => {
  const [{ data: accountData, loading }] = useAccount({
    fetchEns: true,
  })

  return <button onClick={onConnect}>{!loading ? accountData ? accountData.ens?.name || truncateAddress(accountData.address) : "Connect" : "Loading..."}</button>
}