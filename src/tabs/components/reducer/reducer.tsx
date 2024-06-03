import { useEffect, useReducer } from "react"

import { localRemoveCollection, localSaveCollection } from "~tabs/store"

import { Provider } from "../context"
import {
  compareCollections,
  createCollection,
  exportFile,
  generateData,
  importFile,
  updateCollection
} from "../data"
import {
  ADD_TAB,
  EXPORT_DATA,
  IMPORT_DATA,
  REMOVE_COLLECTION,
  REMOVE_TAB,
  SET_COLLECTION,
  SET_COLLECTION_WITH_LOCAL_STORAGE,
  SET_COLLECTIONS,
  SET_CURRENT,
  SET_SELECTED_LIST,
  SET_WINDOW,
  SET_WINDOWS,
  setCollections,
  setWindows,
  UPDATE_TAB
} from "./actions"

interface State {
  source: object
  windows: chrome.windows.Window[]
  collections: Collection[]
  current: chrome.windows.Window | Collection
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
      if (collection.created) {
        // set existed collection
        collection = updateCollection(collection)
        insertIdx = state.collections.findIndex(
          (c) => c.created === collection.created
        )
      } else {
        // action.load is a window
        const window = collection
        collection = createCollection(window)
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
    case EXPORT_DATA: {
      const { collections } = state
      const data = generateData(collections)
      console.log("export json data", data)
      // export
      exportFile(data)
      return state
    }
    case IMPORT_DATA: {
      const data = action.payload
      if (data) {
        // compare new data and old one
        const importCollections = data
        const collections = state.collections
        const newCollections = compareCollections(
          importCollections,
          collections
        )
        // local save
        newCollections.map((collection) => localSaveCollection(collection))
        return { ...state, collections: newCollections }
      }
    }
    case ADD_TAB: {
      const tab = action.payload
      const windows = state.windows
      if (tab) {
        const { windowId, index } = tab
        const window = windows.find((w) => w.id === windowId)
        if (window) {
          window.tabs.splice(index, 0, tab)
        }
        return { ...state, windows }
      }
    }
    case UPDATE_TAB: {
      const tab = action.payload
      const windows = state.windows
      if (tab) {
        const { windowId, index } = tab
        const window = windows.find((w) => w.id === windowId)
        if (window) {
          window.tabs.splice(index, 1, tab)
        }
        return { ...state, windows }
      }
    }
    case REMOVE_TAB: {
      const { tabId, windowId } = action.payload
      const windows = state.windows
      let current = state.current
      if (tabId && windowId) {
        const windowIndex = windows.findIndex((w) => w.id === windowId)
        const window = windows[windowIndex]
        if (window) {
          window.tabs = window.tabs.filter((tab) => tab.id !== tabId)
          windows[windowIndex] = { ...window }
          console.log("REMOVE_TAB", window, state.current)
          if (state.current.id === windowId) {
            current = window // 更新 current
          }
        }
        return { ...state, windows, current }
      }
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
