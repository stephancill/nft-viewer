import "./Logo.css"

interface ILogoProps {
  withDescription?: boolean
}

export const Logo = ({withDescription}: ILogoProps) => {
  return <div className="logo">
    <div>⚓️ Port</div>
    {withDescription ? <div style={{fontSize: "14px", fontStyle: "italic"}}>Digital Asset Viewer</div> : <></>}
  </div>
}