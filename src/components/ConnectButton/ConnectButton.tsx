import { useAccount } from 'wagmi'
import "./ConnectButton.css"

interface IConnectButtonProps {
  onConnect: () => void
}

function truncateAddress(address: string): string {
  const prefix = address.slice(2, 6)
  const suffix = address.slice(address.length-5, address.length)
  return `0x${prefix}...${suffix}`
}

export const ConnectButton = ({onConnect}: IConnectButtonProps) => {
  const [{ data: accountData, loading }] = useAccount({
    fetchEns: true,
  })

  return <button onClick={onConnect}>{!loading ? accountData ? accountData.ens?.name || truncateAddress(accountData.address) : "Connect" : "Loading..."}</button>
}