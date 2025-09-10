import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react"
import { setCollections, setWindows } from "../reducers/actions"
import { reducer } from "./reducer"
import { getAllWindows } from "@/assets/mock/windows"
import { getAllCollections } from "@/store"
import { useSearchCtx } from "../search/searchContext"
import { getAllMockCollections } from "@/assets/mock/collections"

interface State {
  windows: Window[]
  collections: Collection[]
  currentId: number | string | null
  current: any
}

interface GlobalContextType {
  state: State
  dispatch: Dispatch<any>
  current: Window | Collection | undefined
}

const ctx = createContext<GlobalContextType | null>(null)

const { Provider } = ctx

export const useGlobalCtx = () => useContext(ctx)

const initialJSON: State = {
  windows: [],
  collections: [],
  currentId: null,
  current: null,
}

// PERF: current is too slow, when select item in sidebar, Content render is slow, Sidebar is more slow
export const TstProviderReducer = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialJSON)
  const [loading, setLoading] = useState(true)

  // get all tabs info
  const getTabs = async () => {
    try {
      const allWindows = await getAllWindows()
      dispatch(setWindows(allWindows))
      console.log("get all tabs", allWindows)
    } catch (err) {
      console.error("Error get tabs:", err)
    }
  }

  const getCollections = async () => {
    try {
      const allCollections = await getAllMockCollections()
      dispatch(setCollections(allCollections))
      console.log("get all collections", allCollections)
    } catch (err) {
      console.error("Error get collections:", err)
    }
  }

  const getData = async () => {
    setLoading(true)
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

  // 创建 ID 到对象的映射，提升到 Provider 级别以避免重复计算
  const windowMap = useMemo(() => {
    const map = new Map()
    state.windows.forEach((w) => map.set(w.id, w))
    return map
  }, [state.windows])

  const collectionMap = useMemo(() => {
    const map = new Map()
    state.collections.forEach((c) => map.set(c.id, c))
    return map
  }, [state.collections])

  const current = useMemo(() => {
    const currentId = state.currentId
    if (currentId === null) return state.windows[0] || null

    let current = windowMap.get(currentId)
    if (!current) {
      current = collectionMap.get(currentId)
    }
    if (!current) current = state.windows[0] ?? state.collections[0]
    // console.log("📝 memo@current", current)
    return current
  }, [state.currentId, windowMap, collectionMap, state.windows])

  if (loading) return <h1>loading</h1>

  return <Provider value={{ state, dispatch, current }}>{children}</Provider>
}
