export const SET_BASE_DATA = "SET_BASE_DATA"
export const SET_COLLECTIONS = "SET_COLLECTIONS"
export const SET_WINDOWS = "SET_WINDOWS"
export const SET_WINDOW = "SET_WINDOW"
export const SET_COLLECTION = "SET_COLLECTION" // update one collections
export const SET_COLLECTION_WITH_LOCAL_STORAGE =
  "SET_COLLECTION_WITH_LOCAL_STORAGE"
export const REMOVE_COLLECTION = "REMOVE_COLLECTION"
export const SET_CURRENT = "SET_CURRENT"
export const SET_CURRENT_ID = "SET_CURRENT_ID"
export const EXPORT_DATA = "EXPORT_DATA"
export const ADD_TAB = "ADD_TAB"
export const REMOVE_TAB = "REMOVE_TAB"
export const UPDATE_TAB = "UPDATE_TAB"
export const UPDATE_EDITED_LIST = "UPDATE_EDITED_LIST"

export const setWindows = (windows: chrome.windows.Window[]) => ({
  type: SET_WINDOWS,
  payload: windows
})
export const setCollections = (collections: Collection[]) => ({
  type: SET_COLLECTIONS,
  payload: collections
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
export const setCurrentId = (id: number | string) => ({
  type: SET_CURRENT_ID,
  payload: id
})
export const setCurrent = (collection: Collection | chrome.windows.Window) => ({
  type: SET_CURRENT,
  payload: collection
})
export const addTab = (tab) => ({ type: ADD_TAB, payload: tab })
export const updateTab = (tab) => ({ type: UPDATE_TAB, payload: tab })
export const removeTab = (tabId, windowId) => ({
  type: REMOVE_TAB,
  payload: { tabId, windowId }
})

type editedData = {
  id: number | string
  type: "window" | "collection"
  isEdited: boolean
}
export const updateEditedList = (editedData) => ({
  type: UPDATE_EDITED_LIST,
  payload: editedData
})

export const exportData = () => ({ type: EXPORT_DATA })
