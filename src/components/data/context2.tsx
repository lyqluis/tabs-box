import {
	// createContext,
	type Dispatch,
} from "react"

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

export const initialJSON: State = {
	editedMap: {},
	source: {},
	windows: [],
	collections: [],
	currentId: null,
	current: null,
	clipboard: [],
	history: [],
}

interface GlobalContextType {
	state: State
	dispatch: Dispatch<any>
	current: Window | Collection | undefined
	type: "window" | "collection"
}

export const ctx = createContext<GlobalContextType | null>(null)

export const useGlobalCtxSelector = (
	selector: (value: GlobalContextType) => unknown
) => useContextSelector(ctx, selector)
