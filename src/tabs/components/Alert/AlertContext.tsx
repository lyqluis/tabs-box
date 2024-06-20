import { createContext } from "react"

const alertState = {
  isOpen: false,
  title: "",
  message: "",
  type: "info",
  onConfirm: null, // () => void 0
  onCancel: null // () => void 0
}

const OPEN_ALERT = "OPEN_ALERT"
const CLOSE_ALERT = "CLOSE_ALERT"

const alertReducer = (state, action) => {
  switch (action.type) {
    case OPEN_ALERT:
      return { ...state, isOpen: true, ...action.payload }
    case CLOSE_ALERT:
      return { ...state, isOpen: false, ...alertState }
    default:
      return state
  }
}

const AlertContext =  createContext(null)

export const AlertProvider = ({})
