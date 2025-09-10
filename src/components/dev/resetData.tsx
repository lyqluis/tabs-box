import { localClearAllCollections } from "@/store"
import { clearAllBaseCollections } from "@/store/syncBase"

import { useGlobalCtx } from "../contexts/context"
import { setCollections } from "../reducers/actions"

export const useDev = () => {
  const { dispatch } = useGlobalCtx()

  const resetAllCollections = () => {
    dispatch(setCollections([]))
    localClearAllCollections()
  }
  const resetSyncBaseData = () => {
    clearAllBaseCollections()
  }

  return {
    resetAllCollections,
    resetSyncBaseData
  }
}
