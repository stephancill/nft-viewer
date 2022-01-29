import styles from "./AssetItem.module.css"
import React from "react"
import { TokenInfo } from "@uniswap/token-lists"

export interface IAssetItem {
  src: string
  tokenInfo: TokenInfo
  tokenId: number
}

interface IAssetItemProps extends IAssetItem, React.HTMLAttributes<HTMLElement> {
  
}

export const AssetItem = ({style, src, tokenInfo, tokenId}: IAssetItemProps) => {
  return <div className={styles.item} style={style}>
    <img src={src} alt="" />
    <div className={styles.subheading}>{tokenInfo.name}</div>
    <div className={styles.subheading}>#{tokenId}</div>
  </div>
}