export const SET_BASE_DATA = "SET_BASE_DATA"
export const SET_COLLECTIONS = "SET_COLLECTIONS"
export const SET_WINDOWS = "SET_WINDOWS"
export const ADD_WINDOW = "ADD_WINDOW"
export const SET_WINDOW = "SET_WINDOW"
export const REMOVE_WINDOW = "REMOVE_WINDOW"
export const SET_COLLECTION = "SET_COLLECTION" // update one collections
export const SET_COLLECTION_WITH_LOCAL_STORAGE =
  "SET_COLLECTION_WITH_LOCAL_STORAGE"
export const REMOVE_COLLECTION = "REMOVE_COLLECTION"
export const SET_CURRENT = "SET_CURRENT"
export const SET_SELECTED_LIST = "SET_SELECTED_LIST"
export const IMPORT_DATA = "IMPORT_DATA"
export const EXPORT_DATA = "EXPORT_DATA"
export const ADD_TAB = "ADD_TAB"
export const REMOVE_TAB = "REMOVE_TAB"
export const UPDATE_TAB = "UPDATE_TAB"

export const setWindows = (windows: chrome.windows.Window[]) => ({
  type: SET_WINDOWS,
  payload: windows
})
export const setCollections = (collections: Collection[]) => ({
  type: SET_COLLECTIONS,
  payload: collections
})
export const addWindow = (window) => ({ type: ADD_WINDOW, payload: window })
export const removeWindow = (windowId) => ({
  type: REMOVE_WINDOW,
  payload: windowId
})
export const setWindow = (window: chrome.windows.Window) => ({
  type: SET_WINDOW,
  payload: window
})
export const setCollection = (collection: Collection) => ({
  type: SET_COLLECTION,
  payload: collection
})
export const setCollectionWithLocalStorage = (collection: Collection) => ({
  type: SET_COLLECTION_WITH_LOCAL_STORAGE,
  payload: collection
})
export const removeCollection = (collection: Collection) => ({
  type: REMOVE_COLLECTION,
  payload: collection
})
export const setCurrent = (collection: Collection | chrome.windows.Window) => ({
  type: SET_CURRENT,
  payload: collection
})
export const setSelectedList = (list) => ({
  type: SET_SELECTED_LIST,
  payload: list
})
export const addTab = (tab) => ({ type: ADD_TAB, payload: tab })
export const updateTab = (tab) => ({ type: UPDATE_TAB, payload: tab })
export const removeTab = (tabId, windowId) => ({
  type: REMOVE_TAB,
  payload: { tabId, windowId }
})

export const importData = (data) => ({
  type: IMPORT_DATA,
  payload: data
})
export const exportData = () => ({ type: EXPORT_DATA })