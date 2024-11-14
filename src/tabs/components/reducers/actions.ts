export const SET_BASE_DATA = "SET_BASE_DATA"
export const SET_COLLECTIONS = "SET_COLLECTIONS"
export const SET_WINDOWS = "SET_WINDOWS"
export const SET_WINDOW = "SET_WINDOW"
export const SET_COLLECTION = "SET_COLLECTION" // update one collections
export const SET_COLLECTION_WITH_LOCAL_STORAGE =
  "SET_COLLECTION_WITH_LOCAL_STORAGE"
export const SET_CURRENT_ID = "SET_CURRENT_ID"
export const EXPORT_DATA = "EXPORT_DATA"
export const ADD_TAB = "ADD_TAB"
export const REMOVE_TAB = "REMOVE_TAB"
export const UPDATE_TAB = "UPDATE_TAB"
export const UPDATE_EDITED_LIST = "UPDATE_EDITED_LIST"

// CRUD opertaions
// collection
export const ADD_COLLECTION = "ADD_COLLECTION"
export const REMOVE_COLLECTION = "REMOVE_COLLECTION"
export const REMOVE_COLLECTIONS = "REMOVE_COLLECTIONS"
export const UPDATE_COLLECTION = "UPDATE_COLLECTION"
// windows
export const ADD_WINDOW = "ADD_WINDOW"
export const REMOVE_WINDOW = "REMOVE_WINDOW"
export const UPDATE_WINDOW = "UPDATE_WINDOW"

export const ADD_WINDOWS = "ADD_WINDOWS"
export const REMOVE_WINDOWS = "REMOVE_WINDOWS"
export const UPDATE_WINDOWS = "UPDATE_WINDOWS"
// tabs
export const ADD_TABS = "ADD_TABS"
export const REMOVE_TABS = "REMOVE_TABS"
export const UPDATE_TABS = "UPDATE_TABS"
// clipboard
export const COPY = "COPY"
export const PASTE = "PASTE"

export const setWindows = (windows: Window[]) => ({
  type: SET_WINDOWS,
  payload: windows
})
export const setCollections = (collections: Collection[]) => ({
  type: SET_COLLECTIONS,
  payload: collections
})
export const setWindow = (window: Window) => ({
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

export const addCollection = (collection: Collection) => ({
  type: ADD_COLLECTION,
  payload: collection
})
export const removeCollection = (collection: Collection) => ({
  type: REMOVE_COLLECTION,
  payload: collection
})
export const updateCollection = (collection: Collection) => ({
  type: UPDATE_COLLECTION,
  payload: collection
})

export const setCurrentId = (id: number | string) => ({
  type: SET_CURRENT_ID,
  payload: id
})

export const addTab = (tab) => ({ type: ADD_TAB, payload: tab })
export const updateTab = (tab) => ({ type: UPDATE_TAB, payload: tab })
export const removeTab = (tabId, windowId, collectionId?) => ({
  type: REMOVE_TAB,
  payload: { tabId, windowId, collectionId }
})

type EditedData = {
  id: number | string
  type: "window" | "collection"
  isEdited: boolean
}
export const updateEditedList = (editedData: EditedData | string) => ({
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
type UpdatedWindow = {
  window: Window
  collectionId?: string
  index?: number
}
export const updateWindow = ({
  window,
  collectionId,
  index
}: UpdatedWindow) => ({
  type: UPDATE_WINDOW,
  payload: { window, collectionId, index }
})

type AddTabs = {
  tabs: Tab[]
  windowId: WindowId // target window's id
  collectionId?: string | number // target collection's id
  index?: number // specified index
}
export const addTabs = ({ tabs, windowId, collectionId }: AddTabs) => ({
  type: ADD_TABS,
  payload: { tabs, windowId, collectionId }
})

type RemoveTabs = {
  tabIds: (string | number)[]
  windowId: WindowId
  collectionId?: string | number
}
export const removeTabs = ({ tabIds, windowId, collectionId }: RemoveTabs) => {
  return {
    type: REMOVE_TABS,
    payload: { tabIds, windowId, collectionId }
  }
}

type UpdatedTabs = {
  tabs: Tab[]
  windowId: WindowId
  collectionId?: string | number
  index?: number
}
export const updateTabs = ({
  tabs,
  windowId,
  collectionId,
  index
}: UpdatedTabs) => {
  console.log("action -- @windowid", windowId, "@collectionId", collectionId)
  if (windowId === collectionId) collectionId = undefined
  return {
    type: UPDATE_TABS,
    payload: { tabs, windowId, collectionId, index }
  }
}

export const addCopyItems = (
  items: Collection | Window | Tab | Window[] | Tab[]
) => ({
  type: COPY,
  payload: { data: items, copiedTime: Date.now() }
})
export const removeCopyItems = (target: Collection | Window) => ({
  type: PASTE,
  payload: target
})
export const exportData = () => ({ type: EXPORT_DATA })
