import { forwardRef, useImperativeHandle, useRef } from "react"

import { useDialog } from "./DialogContext"

const Dialog = forwardRef((props, ref) => {
  const dialogRef = useRef(null)
  const {
    state: {
      title,
      message,
      content,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    },
    closeDialog
  } = useDialog()

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current.showModal()
  }))

  const handleConfirm = () => {
    onConfirm && onConfirm()
    closeDialog()
  }
  const handleCancel = () => {
    onCancel && onCancel()
    closeDialog()
  }

  return (
    <dialog id="my_modal_1" className="modal" ref={dialogRef}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4">{message}</p>
        {content && <div>{content}</div>}
        <div className="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn mr-2" onClick={handleCancel}>
              {cancelText}
            </button>
            {onConfirm && (
              <button className="btn" onClick={handleConfirm}>
                {confirmText}
              </button>
            )}
          </form>
        </div>
      </div>
    </dialog>
  )
})

export default Dialog
