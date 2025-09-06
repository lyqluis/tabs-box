import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  type FC,
  type ReactNode
} from "react"
import { createPortal } from "react-dom"

import LoadingBtn from "./LoadingBtn"

type ModalProps = {
  isOpen: boolean
  children?: ReactNode
  confirmText?: string | boolean
  cancelText?: string | boolean
  onConfirm?: () => void
  onCancel?: () => void
  title?: string
  content?: ReactNode | string
  message?: string
  confirmLoading?: boolean
  cancelLoading?: boolean
  buttonPosition?: "end" | "center" | "start"
}

export const BaseModal = forwardRef(
  (
    {
      isOpen,
      children,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      title,
      message,
      content,
      confirmLoading,
      cancelLoading,
      buttonPosition = "end"
    },
    ref
  ) => {
    const handleConfirm = async (e) => {
      e.preventDefault() // to prevent auto close modal behaviour
      await onConfirm?.(e)
    }
    const handleCancel = async (e) => {
      e.preventDefault()
      await onCancel?.(e)
    }
    const modalRef = useRef(null)

    useImperativeHandle(ref, () => modalRef.current)

    useEffect(() => {
      if (isOpen && modalRef.current) {
        modalRef.current.showModal()
      }
    }, [isOpen])

    const TitleContent = ({ title, message, content }) => {
      return (
        <>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="py-4">{message}</p>
          {content && content}
        </>
      )
    }

    if (!isOpen) return null // otherwise modal ref may not get from outside

    return (
      <dialog className="modal" ref={modalRef}>
        <div className="modal-box">
          {children ? (
            children
          ) : (
            <TitleContent title={title} message={message} content={content} />
          )}
          {/* if there is a button in form, it will close the modal */}
          {/* TODO: buttons style: 
            1. when only one button, button should be center
        */}
          <form
            method="dialog"
            className={`modal-backdrop grid-flow-col justify-${buttonPosition} gap-2`}
          >
            {cancelText && (
              <button className="btn" onClick={handleCancel}>
                {typeof cancelText === "boolean" ? "Cancel" : cancelText}
              </button>
            )}
            {confirmText &&
              (confirmLoading !== undefined ? (
                <LoadingBtn
                  className="btn btn-primary"
                  loading={confirmLoading}
                  onClick={handleConfirm}
                >
                  {typeof confirmText === "boolean" ? "Ok" : confirmText}
                </LoadingBtn>
              ) : (
                <button className="btn btn-primary" onClick={handleConfirm}>
                  {typeof confirmText === "boolean" ? "Ok" : confirmText}
                </button>
              ))}
          </form>
        </div>
      </dialog>
    )
  }
)

const Modal: FC<ModalProps> = memo((props) => {
  return createPortal(<BaseModal {...props} />, document.body)
})

export default Modal
