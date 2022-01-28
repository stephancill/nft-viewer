import styles from "./AssetItem.module.css"
import React from "react"

export interface IAssetItem {
  src: string
  collectionName: string
  tokenId: number
  address: string
}

interface IAssetItemProps extends IAssetItem, React.HTMLAttributes<HTMLElement> {
  
}

export const AssetItem = ({style, src, collectionName, tokenId}: IAssetItemProps) => {
  return <div className={styles.item} style={style}>
    <img src={src} alt="" />
    <div className={styles.subheading}>{collectionName}</div>
    <div className={styles.subheading}>#{tokenId}</div>
  </div>
}