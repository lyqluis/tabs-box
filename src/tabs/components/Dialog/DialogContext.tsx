import { createContext, useContext, useReducer, useRef } from "react"

import Dialog from "./Dialog"

const DialogContext = createContext(null)

const OPEN_DIALOG = "OPEN_DIALOG"
const CLOSE_DIALOG = "CLOSE_DIALOG"

const dialogState = {
  isOpen: false,
  title: "Dialog Box",
  message: "",
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
    default:
      return state
  }
}

export const DialogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dialogReducer, dialogState)
  const dialogRef = useRef(null)

  const openDialog = ({ message, title, onConfirm }) => {
    dispatch({ type: OPEN_DIALOG, payload: { message, title, onConfirm } })
    dialogRef.current.showModal()
  }
  const closeDialog = () => dispatch({ type: OPEN_DIALOG })

  return (
    <DialogContext.Provider value={{ state, openDialog, closeDialog }}>
      {children}
      <Dialog ref={dialogRef}></Dialog>
    </DialogContext.Provider>
  )
}

export const useDialog = () => useContext(DialogContext)
