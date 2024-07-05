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

// CRUD opertaions
// collections
export const ADD_COLLECTIONS = "ADD_COLLECTIONS"
export const REMOVE_COLLECTIONS = "REMOVE_COLLECTIONS"
export const UPDATE_COLLECTIONS = "UPDATE_COLLECTIONS"
// windows
export const ADD_WINDOW = "ADD_WINDOW"
export const REMOVE_WINDOW = "REMOVE_WINDOW"
export const UPDATE_WINDOW = "UPDATE_WINDOW"
// tabs
export const ADD_TABS = "ADD_TABS"
export const REMOVE_TABS = "REMOVE_TABS"
export const UPDATE_TABS = "UPDATE_TABS"

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
export const removeTab = (tabId, windowId, collectionId) => ({
  type: REMOVE_TAB,
  payload: { tabId, windowId, collectionId }
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

export const addWindow = ({ window, collectionId }) => ({
  type: ADD_WINDOW,
  payload: { window, collectionId }
})
export const removeWindow = ({ windowId, collectionId }) => ({
  type: REMOVE_WINDOW,
  payload: { windowId, collectionId }
})
export const updateWindow = ({ window, collectionId }) => ({
  type: UPDATE_WINDOW,
  payload: { window, collectionId }
})
type AddTabs = {
  tabs: Tab[]
  windowId: string | number // target window's id
  collectionId?: string | number // target collection's id
}
export const addTabs = ({ tabs, windowId, collectionId }: AddTabs) => ({
  type: ADD_TABS,
  payload: { tabs, windowId, collectionId }
})

type RemoveTabs = {
  tabIds: string | number[]
  windowId: string | number
  collectionId?: string | number
}
export const removeTabs = ({ tabIds, windowId, collectionId }: RemoveTabs) => ({
  type: REMOVE_TABS,
  payload: { tabIds, windowId, collectionId }
})

export const exportData = () => ({ type: EXPORT_DATA })
