import { localClearAllCollections } from "@/store"
import { clearAllBaseCollections } from "@/store/syncBase"
import { useGlobalCtxSelector } from "../data"
import { setCollections } from "../data/actions"

export const useDev = () => {
	const dispatch = useGlobalCtxSelector((v) => v.dispatch)

	const resetAllCollections = () => {
		dispatch(setCollections([]))
		localClearAllCollections()
	}
	const resetSyncBaseData = () => {
		clearAllBaseCollections()
	}

	return {
		resetAllCollections,
		resetSyncBaseData,
	}
}
