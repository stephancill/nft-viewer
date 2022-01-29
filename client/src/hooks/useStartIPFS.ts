import { useEffect, useState } from "react";
import * as IPFS from 'ipfs-core'

// Source: https://github.com/youaresoroman/react-ipfs/blob/3cea2e6f5db5a7ecd6ed84acf1033e767f04bb22/src/hooks/useStartIPFS.tsx
export const useStartIPFS = () => {
  const [ipfs, setIpfs] = useState<IPFS.IPFS | null>(null)
  
  const startIpfs = async () => {
    if (!ipfs) {
      try {
        setIpfs(await IPFS.create())
      } catch (error) {
        setIpfs(null)
      }
    }
  }
  
  useEffect(() => {
    startIpfs()
    return function cleanup() {
      if (ipfs && ipfs.stop) {
        ipfs.stop().catch((error: Error) => console.log(`%c${error}`, "color:red"))
        setIpfs(null)
      }
    }
  }, [])
  
  return ipfs
}