import style from "./GenericModal.module.css"

interface IGenericModalProps {
  shouldShow: boolean
  setShouldShow: (visible: boolean) => void,
  content: JSX.Element
}

export const GenericModal = ({shouldShow, setShouldShow, content}: IGenericModalProps) => {

  return <div style={{display: shouldShow ? "block" : "none"}}> 
    <div onClick={() => {setShouldShow(!shouldShow)}} style={{backgroundColor: "rgba(196, 196, 196, 0.74)", zIndex: "1"}} className={style.fullscreenModal}></div>
    <div className={style.fullscreenModal}>
      <div className={style.modalContainer}>
        {content}
      </div>
    </div>
  </div>
}