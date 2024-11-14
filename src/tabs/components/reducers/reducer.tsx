import { useEffect, useMemo, useReducer } from "react"

import { localRemoveCollection, localSaveCollection } from "~tabs/store"
import {
  addWindowToCollection,
  removeWindowFromCollection,
  sortCollections,
  updateWindowInCollections
} from "~tabs/utils/collection"
import {
  addTabsToWindow,
  removeTabsFromWindow,
  setTabsInWindow,
  updateWindowInWindows
} from "~tabs/utils/window"

import { Provider } from "../context"
import {
  createCollection,
  exportFile,
  generateData,
  updateCollection
} from "../data"
import {
  ADD_COLLECTION,
  ADD_TAB,
  ADD_TABS,
  ADD_WINDOW,
  COPY,
  EXPORT_DATA,
  PASTE,
  REMOVE_COLLECTION,
  REMOVE_TAB,
  REMOVE_TABS,
  REMOVE_WINDOW,
  SET_COLLECTION,
  SET_COLLECTION_WITH_LOCAL_STORAGE,
  SET_COLLECTIONS,
  SET_CURRENT_ID,
  SET_WINDOW,
  SET_WINDOWS,
  setCollections,
  setWindows,
  UPDATE_COLLECTION,
  UPDATE_EDITED_LIST,
  UPDATE_TAB,
  UPDATE_TABS,
  UPDATE_WINDOW
} from "./actions"

interface State {
  source: object
  windows: chrome.windows.Window[]
  collections: Collection[]
  currentId: number | string
  selectedList: chrome.tabs.Tab[]
  editedMap: object
  clipboard: clipItem[] // todo: clip item type
}

const initialJSON: State = {
  editedMap: {},
  source: {},
  windows: [],
  collections: [],
  currentId: null,
  selectedList: [],
  clipboard: []
}

const window = {
  lastModified: "timestamp",
  created: "timestamp" // => json‘s created time
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT_ID:
      return { ...state, currentId: action.payload }
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
      // console.log("🧠 reducer SET_COLLECTION", action.payload)
      const collection = action.payload
      const newCollections = state.collections.slice()
      const index = newCollections.findIndex((c) => c.id === collection.id)
      if (index > -1) {
        newCollections.splice(index, 1, collection)
        return { ...state, collections: sortCollections(newCollections) }
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
    case ADD_COLLECTION: {
      const collection = action.payload
      const newCollections = state.collections.slice()
      newCollections.push(collection)
      // ?? set to local store
      // localSaveCollection(collection)
      return {
        ...state,
        collections: sortCollections(newCollections)
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
    case UPDATE_COLLECTION: {
      const collection = action.payload
      const newCollections = state.collections.slice()
      const index = newCollections.findIndex((c) => c.id === collection.id)
      if (index > -1) {
        newCollections.splice(index, 1, collection)
        return { ...state, collections: sortCollections(newCollections) }
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
    case ADD_WINDOW: {
      console.log("🧠 reducer ADD_WINDOW", action.payload)
      const { window, collectionId } = action.payload
      // add window to collection.windows
      if (collectionId) {
        const collections = addWindowToCollection(
          window,
          collectionId,
          state.collections
        )
        console.log("@collections", collections)
        return { ...state, collections }
      }
      // add window to windows
      const windows = [...state.windows, window]
      return { ...state, windows }
    }
    case REMOVE_WINDOW: {
      console.log("🧠 reducer REMOVE_WINDOW", action.payload)
      const { windowId, collectionId } = action.payload
      // remove window from collection.windows
      if (collectionId) {
        const collections = removeWindowFromCollection(
          windowId,
          collectionId,
          state.collections
        )
        return { ...state, collections }
      }
      // remove window from windows
      const windows = state.windows.filter((w) => w.id !== windowId)
      return { ...state, windows }
    }
    case UPDATE_WINDOW: {
      console.log("🧠 reducer UPDATE_WINDOW", action.payload)
      const { window, collectionId, index } = action.payload
      // update window in collection.windows
      if (collectionId) {
        const collections = updateWindowInCollections(
          window,
          collectionId,
          state.collections,
          index
        )
        return { ...state, collections }
      }
      // update window in windows
      const windows = updateWindowInWindows(window, state.windows, index)
      return { ...state, windows }
    }
    case ADD_TABS: {
      console.log("🧠 reducer ADD_TABS", action.payload)
      const { tabs, windowId, collectionId, index } = action.payload
      // change tabs' windowId to new windowId
      tabs.map((tab) => {
        tab.windowId = windowId
        if (!collectionId) {
          // add tabs to sidebar window
          tab.hidden = false
          tab.checked = false
        }
        return tab
      })

      // add tabs to collection.window
      if (collectionId) {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId) {
            const windows = addTabsToWindow(
              tabs,
              windowId,
              collection.windows,
              index
            )
            return { ...collection, windows }
          }
          return collection
        })
        return { ...state, collections }
      }
      // add tabs to window
      const windows = addTabsToWindow(tabs, windowId, state.windows, index)
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
    case UPDATE_TABS: {
      console.log("🧠 reducer UPDATE_TABS", action.payload)
      const { tabs, windowId, collectionId, index } = action.payload
      // set tabs from collection.window
      if (collectionId) {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId) {
            const windows = setTabsInWindow(
              tabs,
              windowId,
              collection.windows,
              index
            )
            console.log("🧠 reducer UPDATE_TABS @windows", windows)
            return { ...collection, windows }
          }
          return collection
        })
        return { ...state, collections }
      }
      // set tabs from window
      const windows = setTabsInWindow(tabs, windowId, state.windows, index)
      return { ...state, windows }
    }
    // TODO: use utils/clipboard
    case COPY: {
      const item = action.payload
      // const copiedClipboard = state.clipboard.slice()
      // ? cause clipboard no need to be reactive
      state.clipboard.push(item)
      return { ...state, clipboard: state.clipboard }
    }
    case PASTE: {
      const target = action.payload
      const item = state.clipboard.pop()
      // todo: add item to target
      // item is window, target is colletion, add new window to the target

      return { ...state, clipboard: state.clipboard }
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

  const current = useMemo(() => {
    const currentId = state.currentId
    let current = state.windows.find((w) => w.id === currentId)
    if (!current) {
      current = state.collections.find((c) => c.id === currentId)
    }
    if (!current) current = state.windows[0]
    console.log("📝 memo@current", current)
    return current
  }, [state.currentId, state.windows, state.collections])

  const type = useMemo(() => {
    // console.log("📝 memo@type", type)
    return current?.created ? "collection" : "window"
  }, [current])

  return (
    <Provider value={{ state, dispatch, current, type }}>{children}</Provider>
  )
}
