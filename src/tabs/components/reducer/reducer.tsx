import { useEffect, useReducer } from "react"

import { localRemoveCollection, localSaveCollection } from "~tabs/store"

import { Provider } from "../context"
import {
  REMOVE_COLLECTION,
  SET_COLLECTION,
  SET_COLLECTION_WITH_LOCAL_STORAGE,
  SET_COLLECTIONS,
  SET_CURRENT,
  SET_SELECTED_LIST,
  SET_WINDOW,
  SET_WINDOWS,
  setCollections,
  setSelectedList,
  setWindows
} from "./actions"

interface State {
  source: object
  windows: chrome.windows.Window[]
  collections: collection[]
  current: chrome.windows.Window | collection
  selectedList: chrome.tabs.Tab[]
}

const initialJSON: State = {
  source: {},
  windows: [],
  collections: [],
  current: null,
  selectedList: []
}

const window = {
  lastModified: "timestamp",
  created: "timestamp" // => json‘s created time
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT:
      return { ...state, current: action.payload }
    case SET_WINDOWS:
      return { ...state, windows: action.payload }
    case SET_COLLECTIONS:
      return { ...state, collections: action.payload }
    case SET_WINDOW: {
      const window = action.payload
      const newWindows = state.windows.slice()
      const index = newWindows.findIndex((w) => w.id === window.id)
      if (index < 0) return state
      newWindows.splice(index, 1, window)
      return { ...state, windows: newWindows }
    }
    case SET_COLLECTION: {
      const collection = action.payload
      const newCollections = state.collections.slice()
      const index = newCollections.findIndex(
        (c) => c.created === collection.created
      )
      if (index < 0) return state
      newCollections.splice(index, 1, collection)
      return { ...state, collections: newCollections }
    }
    case SET_COLLECTION_WITH_LOCAL_STORAGE: {
      // set single collection
      let collection = action.payload
      let insertIdx = 0
      let removeCount = 1
      const newCollections = state.collections.slice()
      if (action.payload.created) {
        // set existed collection
        insertIdx = state.collections.findIndex(
          (c) => c.created === collection.created
        )
      } else {
        // add new collection
        const created = Date.now()
        // wrapper the window to collection data
        collection = {
          created,
          updated: created,
          title: collection.tabs[0]?.title ?? "", // give a default title
          windows: [collection]
        }
        // add to the first index after pinned
        insertIdx = state.collections.findIndex((c) => !c.pinned)
        removeCount = 0
      }
      const current = collection
      newCollections.splice(insertIdx, removeCount, collection)
      // set to local store
      localSaveCollection(collection)
      // switch current to the new one
      return { ...state, collections: newCollections, current }
    }
    case REMOVE_COLLECTION: {
      const target = action.payload
      const newCollections = state.collections.filter(
        (c) => c.created !== target.created
      )
      // set to local store
      localRemoveCollection(target)
      return {
        ...state,
        collections: newCollections,
        current: state.windows[0]
      }
    }
    case SET_SELECTED_LIST: {
      const newList = action.payload
      return { ...state, selectedList: newList }
    }
    // other case...
  }
}

export const ProviderWithReducer = ({
  data: { windows, collections },
  children
}) => {
  const [state, dispatch] = useReducer(reducer, initialJSON)
  // set initial windows & collections
  useEffect(() => {
    dispatch(setWindows(windows))
    dispatch(setCollections(collections))
  }, [windows, collections])

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
