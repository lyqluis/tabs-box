export const SET_BASE_DATA = "SET_BASE_DATA"
export const SET_COLLECTIONS = "SET_COLLECTIONS"
export const SET_WINDOWS = "SET_WINDOWS"
export const SET_WINDOW = "SET_WINDOW"
export const SET_COLLECTION = "SET_COLLECTION" // update one collections
export const SET_COLLECTION_WITH_LOCAL_STORAGE =
  "SET_COLLECTION_WITH_LOCAL_STORAGE"
export const REMOVE_COLLECTION = "REMOVE_COLLECTION"
export const SET_CURRENT = "SET_CURRENT"
export const SET_SELECTED_LIST = "SET_SELECTED_LIST"

export const setWindows = (windows: chrome.windows.Window[]) => ({
  type: SET_WINDOWS,
  payload: windows
})
export const setCollections = (collections: collection[]) => ({
  type: SET_COLLECTIONS,
  payload: collections
})
export const setWindow = (window: chrome.windows.Window) => ({
  type: SET_WINDOW,
  payload: window
})
export const setCollection = (collection: collection) => ({
  type: SET_COLLECTION,
  payload: collection
})
export const setCollectionWithLocalStorage = (collection: collection) => ({
  type: SET_COLLECTION_WITH_LOCAL_STORAGE,
  payload: collection
})
export const removeCollection = (collection: collection) => ({
  type: REMOVE_COLLECTION,
  payload: collection
})
export const setCurrent = (collection: collection | chrome.windows.Window) => ({
  type: SET_CURRENT,
  payload: collection
})
export const setSelectedList = (list) => ({
  type: SET_SELECTED_LIST,
  payload: list
})
