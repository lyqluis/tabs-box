import { createContext, useContext, useReducer } from "react"

const HistoryContext = createContext(null)

const ADD_ACTION = "ADD_ACTION"
const REMOVE_ACTION = "REMOVE_ACTION"
const CLEAR_STACK = "CLEAR_STACK"

const historyReducer = (state, action) => {
  switch (action.type) {
    case ADD_ACTION:
      // TODO save to local
      return { ...state, stack: [...state.stack, action.payload] }
  }
}

type operationTab = {
  type: "remove" | "move" | "create"
  tabId: number
  windowId: number
  rawIndex: number
  index: number
  url: string
}

type operation = {
  queue: operationTab[]
}

const historyStack: operation[] = []

// actions
export const addAction = (operation) => ({
  type: ADD_ACTION,
  payload: operation
})

export const HistoryProvider = ({ children }) => {
  const [history, dispatch] = useReducer(historyReducer, historyStack)

  return (
    <HistoryContext.Provider value={{ history, dispatch }}>
      {children}
    </HistoryContext.Provider>
  )
}

export const useHistory = () => useContext(HistoryContext)
