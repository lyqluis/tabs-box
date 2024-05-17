export const SET_BASE_DATA = "SET_BASE_DATA"
export const SET_COLLECTIONS = "SET_COLLECTIONS"
export const SET_WINDOWS = "SET_WINDOWS"

export const setWindows = (windows: chrome.windows.Window[]) => ({
  type: SET_WINDOWS,
  payload: windows
})
export const setCollections = (collections: collection[]) => ({
  type: SET_COLLECTIONS,
  payload: collections
})
