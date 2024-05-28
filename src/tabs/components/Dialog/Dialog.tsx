import { forwardRef, useImperativeHandle, useRef } from "react"

import { useDialog } from "./DialogContext"

const Dialog = forwardRef((props, ref) => {
  const dialogRef = useRef(null)
  const {
    state: { title, message, onConfirm, onCancel },
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
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="mr-2 btn" onClick={handleCancel}>
              Close
            </button>
            <button className="btn" onClick={handleConfirm}>
              Confirm
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
})

export default Dialog
