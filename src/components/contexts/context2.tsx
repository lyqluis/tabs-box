import {
	// createContext,
	type Dispatch,
	type ReactNode,
	useCallback,
	// useContext,
	useEffect,
	useMemo,
	useReducer,
	useState,
} from "react"

import { setCollections, setWindows } from "../reducers/actions"
import { reducer } from "../reducers/reducer"
import { getAllWindows } from "@/assets/mock/windows"
import { getAllMockCollections } from "@/assets/mock/collections"
import { createContext, useContextSelector } from "use-context-selector"

interface State {
	editedMap: object
	source: object
	windows: Window[]
	collections: Collection[]
	currentId: number | string | null
	current: any
	clipboard: clipItem[] // todo: clip item type
	history?: Collection[]
}

interface GlobalContextType {
	state: State
	dispatch: Dispatch<any>
	current: Window | Collection | undefined
	type: "window" | "collection"
}

const ctx = createContext<GlobalContextType | null>(null)

const { Provider } = ctx

export const useGlobalCtxSelector = (cb) => useContextSelector(ctx, cb)

const initialJSON: State = {
	editedMap: {},
	source: {},
	windows: [],
	collections: [],
	currentId: null,
	current: null,
	clipboard: [],
	history: [],
}

// PERF: current is too slow, when select item in sidebar, Content render is slow, Sidebar is more slow
export const ProviderWithReducer = ({
	// data: { windows, collections },
	children,
}: {
	// data: { windows: Window[]; collections: Collection[] }
	children: ReactNode
}) => {
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

	const findCurrent = useCallback(
		(currentId, windows, windowMap, collectionMap) => {
			if (currentId === null) return windows[0] || null
			return (
				windowMap.get(currentId) || collectionMap.get(currentId) || windows[0]
			)
			// console.log("📝 memo@current", current)
		},
		[]
	)

	const current = useMemo(() => {
		const res = findCurrent(
			state.currentId,
			state.windows,
			windowMap,
			collectionMap
		)
		console.log("find current", res)
		return res
	}, [state.currentId, windowMap, collectionMap, state.windows, findCurrent])

	const type = useMemo(() => {
		// console.log("📝 memo@type", type)
		return current?.created ? "collection" : "window"
	}, [current])

	if (loading) return <h1>loading</h1>

	return (
		<Provider value={{ state, dispatch, current, type }}>{children}</Provider>
	)
}
