import { useEffect, useReducer } from "react"

import { Provider } from "../context"
import { SET_COLLECTIONS, SET_WINDOWS, setWindows } from "./actions"

const initialJSON = {
  source: {},
  windows: [], // window[]
  collections: [] // window[]
}

const window = {
  lastModified: "timestamp",
  created: "timestamp" // => json‘s created time
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_WINDOWS:
      return { ...state, windows: action.payload }
    case SET_COLLECTIONS:
      return {...state, collections: action.payload}
    // other case...
  }
}

export const ProviderWithReducer = ({ data: windows, children }) => {
  const [state, dispatch] = useReducer(reducer, initialJSON)
  // set windows to state
  useEffect(() => {
    dispatch(setWindows(windows))
  }, [windows])
  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
