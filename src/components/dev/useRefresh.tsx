import { useGlobalCtx } from "@/components/contexts/context"
import {
  setCollections,
  setWindows,
  updateEditedList
} from "@/components/reducers/actions"
import { getAllCollections } from "@/store"
import { sortCollections } from "@/utils/collection"
import { getAllWindows } from "@/utils/platform"

export const useRefresh = () => {
  const { current, dispatch } = useGlobalCtx()

  const getAllTabs = async () => {
    try {
      const allWindows = await getAllWindows()
      // console.log("all windows", allWindows)
      dispatch(setWindows(allWindows))
      return allWindows
    } catch (err) {
      console.error("Error get tabs:", err)
    }
  }

  const getCollections = async () => {
    try {
      const allCollections = await getAllCollections()
      // console.log("all collectioins from store", allCollections)
      // set pinned collection to the first of the list & sort by date
      const sortedCollections = sortCollections(allCollections)
      dispatch(setCollections(sortedCollections))
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
    dispatch(updateEditedList("clear_all"))
  }

  // useEffect(() => {
  //   console.log("🪝 use refresh, collections", collections)
  // }, [collections])

  const RefreshBtn = () => {
    return (
      <button className="btn btn-outline btn-primary p-2" onClick={getData}>
        refersh
      </button>
    )
  }

  return { RefreshBtn }
}
