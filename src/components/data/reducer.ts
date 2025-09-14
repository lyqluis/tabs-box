import { localRemoveCollection, localSaveCollection } from "@/store"
import {
  addWindowToCollection,
  removeWindowFromCollection,
  sortCollections,
  updateWindowInCollections
} from "@/utils/collection"
import {
  baseExportData,
  createCollection,
  exportFile,
  generateData,
  updateCollection
} from "@/utils/data"
import {
  addTabsToWindow,
  removeTabsFromWindow,
  setTabsInWindow,
  updateWindowInWindows
} from "@/utils/window"

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
  SET_CURRENT,
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

export const reducer = (state: any, action: any) => {
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
    case ADD_COLLECTION: {
      const collection = action.payload
      const newCollections = state.collections.slice()
      newCollections.push(collection)
      localSaveCollection(collection)
      return {
        ...state,
        collections: sortCollections(newCollections)
      }
    }
    case REMOVE_COLLECTION: {
      const { collection: target } = action.payload

      let newCollections = state.collections
      newCollections = state.collections.filter((c) => c.id !== target.id)
      localRemoveCollection(target)
      baseExportData.modified = Date.now() // record global modified timestamp
      return {
        ...state,
        collections: newCollections
      }
    }
    case UPDATE_COLLECTION: {
      // console.log("🧠 reducer UPDATE_COLLECTION", action.payload)
      const collection = action.payload
      const newCollections = state.collections.slice()
      localSaveCollection(collection)
      return { ...state, collections: sortCollections(newCollections) }
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
      break
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
      break
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
      return state
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
        const { collections, targetCollection } = addWindowToCollection(
          window,
          collectionId,
          state.collections
        )
        const target = updateCollection(targetCollection)
        localSaveCollection(target)
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
        const { collections, targetCollection } = removeWindowFromCollection(
          windowId,
          collectionId,
          state.collections
        )
        const target = updateCollection(targetCollection)
        localSaveCollection(target)
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
        const { collections, updatedCollection } = updateWindowInCollections(
          window,
          collectionId,
          state.collections,
          index
        )
        const target = updateCollection(updatedCollection)
        localSaveCollection(target)
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
            collection.windows = windows
            const updatedCollection = updateCollection(collection)
            localSaveCollection(updatedCollection)
            return updatedCollection
          }
          return collection
        })
        return { ...state, collections: sortCollections(collections) }
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
            collection.windows = windows
            const updatedCollection = updateCollection(collection)
            localSaveCollection(updatedCollection)
            return updatedCollection
          }
          return collection
        })
        return { ...state, collections: sortCollections(collections) }
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
            collection.windows = windows
            const updatedCollection = updateCollection(collection)
            localSaveCollection(updatedCollection)
            return updatedCollection
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
