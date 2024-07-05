import { useEffect, useMemo, useReducer } from "react"

import { localRemoveCollection, localSaveCollection } from "~tabs/store"
import { sortCollections } from "~tabs/utils/collection"
import { addTabsToWindow, removeTabsFromWindow } from "~tabs/utils/window"

import { Provider } from "../context"
import {
  createCollection,
  exportFile,
  generateData,
  updateCollection
} from "../data"
import {
  ADD_TAB,
  ADD_TABS,
  EXPORT_DATA,
  REMOVE_COLLECTION,
  REMOVE_TAB,
  REMOVE_TABS,
  SET_COLLECTION,
  SET_COLLECTION_WITH_LOCAL_STORAGE,
  SET_COLLECTIONS,
  SET_CURRENT,
  SET_CURRENT_ID,
  SET_WINDOW,
  SET_WINDOWS,
  setCollections,
  setCurrent,
  setWindows,
  UPDATE_EDITED_LIST,
  UPDATE_TAB
} from "./actions"

interface State {
  source: object
  windows: chrome.windows.Window[]
  collections: Collection[]
  currentId: number | string
  current: chrome.windows.Window | Collection
  selectedList: chrome.tabs.Tab[]
  editedMap: object
}

const initialJSON: State = {
  editedMap: {},
  source: {},
  windows: [],
  collections: [],
  current: null,
  currentId: null,
  selectedList: []
}

const window = {
  lastModified: "timestamp",
  created: "timestamp" // => json‘s created time
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT_ID:
      return { ...state, currentId: action.payload }
    case SET_CURRENT:
      return { ...state, current: action.payload }
    case SET_WINDOWS:
      // console.log("🧠 reducer SET_WINDOWS", action.payload)
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
      const index = newCollections.findIndex((c) => c.id === collection.id)
      if (index > -1) {
        newCollections.splice(index, 1, collection)
        return { ...state, collections: newCollections }
      }
    }
    case SET_COLLECTION_WITH_LOCAL_STORAGE: {
      // set single collection
      let collection = action.payload
      let insertIdx = 0
      let removeCount = 1
      const newCollections = state.collections.slice()
      if (collection.created) {
        // update existed collection
        collection = updateCollection(collection)
        insertIdx = state.collections.findIndex(
          (c) => c.created === collection.created
        )
      } else {
        // action.load is a window in collection
        const window = collection
        collection = createCollection(window)
        // add to the first index after pinned
        insertIdx = state.collections.findIndex((c) => !c.pinned)
        removeCount = 0
      }
      newCollections.splice(insertIdx, removeCount, collection)
      // sort new collections
      const sortedCollections = sortCollections(newCollections)
      // set to local store
      localSaveCollection(collection)
      // switch current to the new one
      return {
        ...state,
        collections: sortedCollections,
        currentId: collection.id
      }
    }
    case REMOVE_COLLECTION: {
      const target = action.payload
      const newCollections = state.collections.filter((c) => c.id !== target.id)
      // set to local store
      localRemoveCollection(target)
      return {
        ...state,
        collections: newCollections
      }
    }
    case EXPORT_DATA: {
      const { collections } = state
      const data = generateData(collections)
      console.log("export json data", data)
      // export
      exportFile(data)
      return state
    }
    case ADD_TAB: {
      const tab = action.payload
      const windows = state.windows.slice()
      if (tab) {
        const { windowId, index } = tab
        const window = windows.find((w) => w.id === windowId)
        if (window) {
          if (!window.tabs) window.tabs = [] // new window created doesn't have tabs
          window.tabs.splice(index, 0, tab)
        }
        return { ...state, windows }
      }
    }
    case UPDATE_TAB: {
      const tab = action.payload
      const windows = state.windows.slice()
      if (tab) {
        const { windowId, index } = tab
        const windowIndex = windows.findIndex((w) => w.id === windowId)
        if (windowIndex > -1) {
          // copy a new window to let List component update
          const window = { ...windows[windowIndex] }
          window.tabs.splice(index, 1, tab)
          windows[windowIndex] = window
        }
        return { ...state, windows }
      }
    }
    case REMOVE_TAB: {
      console.log("🧠 reducer REMOVE_TAB", action.payload)
      const { tabId, windowId } = action.payload
      const windows = state.windows.slice()
      if (tabId && windowId) {
        const windowIndex = windows.findIndex((w) => w.id === windowId)
        if (windowIndex > -1) {
          // copy a new window to let List component update
          const window = { ...windows[windowIndex] }
          const tabIndex = window.tabs.findIndex((t) => t.id === tabId)
          tabIndex > -1 && window.tabs.splice(tabIndex, 1)
          windows[windowIndex] = window
        }
        return { ...state, windows }
      }
    }
    case UPDATE_EDITED_LIST: {
      console.log("🧠 reducer UPDATE_EDITED_LIST", action.payload)
      if (action.payload === "clear_all") {
        return { ...state, editedMap: {} }
      }
      const { id, type, isEdited } = action.payload
      state.editedMap[id] = isEdited
      return { ...state }
    }
    case ADD_TABS: {
      console.log("🧠 reducer ADD_TABS", action.payload)
      const { tabs, windowId } = action.payload
      // change tabs' windowId to new windowId
      tabs.map((tab) => {
        tab.windowId = windowId
        return tab
      })
      
      const collectionId = action.payload.collectionId
      // add tabs to collection.window
      if (collectionId) {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId) {
            const windows = addTabsToWindow(tabs, windowId, collection.windows)
            return { ...collection, windows }
          }
          return collection
        })
        return { ...state, collections }
      }
      // add tabs to window
      const windows = addTabsToWindow(tabs, windowId, state.windows)
      return { ...state, windows }
    }
    case REMOVE_TABS: {
      console.log("🧠 reducer REMOVE_TABS", action.payload)
      const { tabIds, windowId } = action.payload
      const collectionId = action.payload.collectionId
      // remove tabs from collection.window
      if (collectionId) {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId) {
            const windows = removeTabsFromWindow(
              tabIds,
              windowId,
              collection.windows
            )
            return { ...collection, windows }
          }
          return collection
        })
        return { ...state, collections }
      }
      // remove tabs from window
      const windows = removeTabsFromWindow(tabIds, windowId, state.windows)
      return { ...state, windows }
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

  useEffect(() => {
    const currentId = state.currentId
    let current
    current = state.windows.find((w) => w.id === currentId)
    if (!current) {
      current = state.collections.find((c) => c.id === currentId)
    }
    if (!current) current = state.windows[0]
    console.log("🪝 auto find current", current)
    dispatch(setCurrent(current))
  }, [state.currentId, state.windows, state.collections])

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
