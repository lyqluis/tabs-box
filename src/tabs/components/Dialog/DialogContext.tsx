import { createContext, useContext, useReducer, useRef } from "react"

import Dialog from "./Dialog"

const DialogContext = createContext(null)

const OPEN_DIALOG = "OPEN_DIALOG"
const CLOSE_DIALOG = "CLOSE_DIALOG"
const SET_DIALOG = "SET_DIALOG"

const dialogState = {
  isOpen: false,
  title: "Dialog Box",
  message: "",
  content: null,
  confirmText: "Confirm",
  cancelText: "Cancel",
  onConfirm: null, // () => void 0
  onCancel: null, // () => void 0
  type: "info" // ?
}

const dialogReducer = (state, action) => {
  switch (action.type) {
    case OPEN_DIALOG:
      return { ...state, isOpen: true, ...action.payload }
    case CLOSE_DIALOG:
      return { ...state, ...dialogState }
    case SET_DIALOG:
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export const DialogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dialogReducer, dialogState)
  const dialogRef = useRef(null)

  const openDialog = ({
    message,
    title,
    content,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel"
  }) => {
    dispatch({
      type: OPEN_DIALOG,
      payload: { message, title, content, onConfirm, confirmText, cancelText }
    })
    dialogRef.current.showModal()
  }
  const closeDialog = () => dispatch({ type: OPEN_DIALOG })
  const setDialog = (dialogState) =>
    dispatch({ type: SET_DIALOG, payload: dialogState })

  return (
    <DialogContext.Provider
      value={{ state, openDialog, setDialog, closeDialog }}
    >
      {children}
      <Dialog ref={dialogRef}></Dialog>
    </DialogContext.Provider>
  )
}

export const useDialog = () => useContext(DialogContext)
