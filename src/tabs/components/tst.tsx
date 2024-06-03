假设你是一名资深react开发专家，分析以下代码，为什么当dispatch REMOVE_TAB 事件后，Content界面无法及时更新，但是log出来的reducer中的数据都已经更新好了
// reducer.ts
const initialJSON: State = {
  source: {},
  windows: [],
  collections: [],
  current: null,
  selectedList: []
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
      if (tabId && windowId) {
        const window = windows.find((w) => w.id === windowId)
        if (window) {
          const newTabs = window.tabs.filter((tab) => tab.id !== tabId)
          window.tabs = newTabs
          console.log("REMOVE_TAB", window, state.current)
        }
        return { ...state, windows }
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

// action.ts
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

// App.tsx

const TabsBoxPage = () => {
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState([])
  const [collections, setCollections] = useState([])
  const [current, setCurrent] = useState(null)

  // get all tabs info
  const getTabs = async () => {
    try {
      const allWindows = await getAllWindows()
      console.log("all windows", allWindows)
      setWindows(allWindows)
      setCurrent(allWindows[0])
    } catch (err) {
      console.error("Error get tabs:", err)
    }
  }

  const getCollections = async () => {
    try {
      const allCollections = await getAllCollections()
      // set pinned collection to the first of the list & sort by date
      const pinnedCollections = allCollections
        .filter((c) => c.pinned)
        .sort((a, b) => b.updated - a.updated)
      const restCollections = allCollections
        .filter((c) => !c.pinned)
        .sort((a, b) => b.updated - a.updated)
      console.log("all collectioins from store", allCollections)
      setCollections([...pinnedCollections, ...restCollections])
    } catch (err) {
      console.error("Error get collections:", err)
    }
  }

  const getData = async () => {
    try {
      await getTabs()
      await getCollections()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  if (loading) {
    return <h2>loading</h2>
  }
  return (
    <ProviderWithReducer data={{ windows, collections }}>
      <div className="flex">
        <SideBar></SideBar>
        <main className="w-full overflow-hidden">
          <Header></Header>
          <Content></Content>
        </main>
      </div>
    </ProviderWithReducer>
  )
}

export default TabsBoxPage

// Content.tsx
const Content = ({}) => {
  const {
    state: { current, windows, collections },
    dispatch
  } = useGlobalCtx()

  if (!current) return <h1>loading</h1>

  // window
  if (current.tabs) {
    return (
      <>
        <ContentLayout selectedItem={current}>
          <List window={current}></List>
        </ContentLayout>
      </>
    )
  }

  // collection
  const list = current.windows
  return (
    <>
      <ContentLayout selectedItem={current}>
        {list.map((window) => (
          <List key={window.id} window={window}></List>
        ))}
      </ContentLayout>
    </>
  )
}

export default Content