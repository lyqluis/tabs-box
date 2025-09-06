export const SET_COLLECTIONS = "SET_COLLECTIONS"
export const SET_WINDOWS = "SET_WINDOWS"
export const SET_CURRENT_ID = "SET_CURRENT_ID"
export const SET_CURRENT = "SET_CURRENT"

export const setWindows = (windows: Window[]) => ({
	type: SET_WINDOWS,
	payload: windows,
})
export const setCollections = (collections: Collection[]) => ({
	type: SET_COLLECTIONS,
	payload: collections,
})
export const setCurrent = (windowOrCollection: Collection | Window) => ({
	type: SET_CURRENT,
	payload: windowOrCollection,
})
export const setCurrentId = (id: number | string) => ({
	type: SET_CURRENT_ID,
	payload: id,
})

export const reducer = (state: any, action: any) => {
	switch (action.type) {
		case SET_CURRENT_ID:
			return { ...state, currentId: action.payload }
		case SET_CURRENT:
			return { ...state, current: action.payload }
		case SET_WINDOWS:
			// console.log("🧠 reducer SET_WINDOWS", action.payload)
			return { ...state, windows: action.payload }
		case SET_COLLECTIONS:
			return { ...state, collections: action.payload }
		// other case...
	}
}
