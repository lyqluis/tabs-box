import { memo, useEffect } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  setCollections,
  setCurrent,
  setWindows,
  updateEditedList
} from "~tabs/components/reducers/actions"
import { getAllCollections } from "~tabs/store"

import { getAllWindows } from "./platform"

export const useRefresh = () => {
  const {
    state: { current, windows, collections },
    dispatch
  } = useGlobalCtx()

  const getAllTabs = async () => {
    try {
      const allWindows = await getAllWindows()
      console.log("all windows", allWindows)
      dispatch(setWindows(allWindows))
      return allWindows
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
      dispatch(setCollections([...pinnedCollections, ...restCollections]))
      return allCollections
    } catch (err) {
      console.error("Error get collections:", err)
    }
  }

  const resetCurrent = (windows, collections) => {
    const id = current.id
    const type = current.created ? "collection" : "window"
    const list = type === "window" ? windows : collections
    const newCurrent = list.find((item) => item.id === id)
    newCurrent && dispatch(setCurrent(newCurrent))
  }

  const getData = async () => {
    const windows = await getAllTabs()
    const collections = await getCollections()
    resetCurrent(windows, collections)
    dispatch(updateEditedList('clear_all'))
  }

  useEffect(() => {
    console.log("🪝 use refresh, collections", collections)
  }, [collections])

  const RefreshBtn = () => {
    return (
      <button className="btn btn-outline btn-primary p-2" onClick={getData}>
        refersh
      </button>
    )
  }

  return { RefreshBtn }
}
