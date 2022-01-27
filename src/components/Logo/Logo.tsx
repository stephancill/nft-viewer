import style from "./Logo.module.css"

interface ILogoProps {
  withDescription?: boolean
}

export const Logo = ({withDescription}: ILogoProps) => {
  return <div className={style.logo}>
    <div>⚓️ Port</div>
    {withDescription ? <div style={{fontSize: "14px", fontStyle: "italic"}}>Digital Asset Viewer</div> : <></>}
  </div>
}