import { useEffect, useMemo, useState } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  addTabs,
  removeTab,
  removeTabs,
  setCollection,
  updateEditedList
} from "~tabs/components/reducers/actions"
import { openTabs } from "~tabs/utils/platform"

// select several tabs in several windows of collections
const useSeletedList = (currentId, type) => {
  const {
    state: { current, collections },
    dispatch
  } = useGlobalCtx()

  const [selectedList, setSelectedList] = useState([])
  const tabsByWindowMap = useMemo(() => {
    return selectedList.reduce((map, tab) => {
      if (!map.has(tab.windowId)) map.set(tab.windowId, [])
      map.get(tab.windowId).push(tab)
      return map
    }, new Map())
  }, [selectedList])
  console.log("tabs grouped by window", tabsByWindowMap)

  const onSelect = ({ tab, isSelected }) => {
    if (isSelected) {
      // add
      const existed = selectedList.find((t) => t.url === tab.url)
      if (existed) return
      setSelectedList([...selectedList, tab])
    } else {
      // remove
      setSelectedList(selectedList.filter((t) => t.url !== tab.url))
    }
    console.log("on select", tab, type, selectedList)
  }

  const openSelected = () => {
    openTabs(selectedList)
    setSelectedList([])
  }
  // delect from reducer
  const deleteSelected = () => {
    const collectionId = type === "collection" ? current.id : ""
    tabsByWindowMap.forEach((tabs, windowId) => {
      const tabIds = tabs.map((tab) => tab.id)
      dispatch(removeTabs({ tabIds, windowId, collectionId }))
    })
    // TODO type is window/collection.window
    setSelectedList([])
    dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
  }

  const addSelectedToCollection = (collectionId, keep = false) => {
    console.log("add selected to collection", collectionId)

    const originId = type === "collection" ? current.id : ""
    const collection = collections.find((c) => c.id === collectionId)
    const targetWindowId = collection.windows[0].id
    tabsByWindowMap.forEach((tabs, windowId) => {
      dispatch(
        addTabs({
          tabs: selectedList,
          windowId: targetWindowId,
          collectionId
        })
      )
      // delete tabs from origin collection
      if (!keep && type === "collection") {
        const tabIds = tabs.map((tab) => tab.id)
        dispatch(removeTabs({ tabIds, windowId, collectionId: originId }))
      }
    })
    // TODO type is window/collection.window
    setSelectedList([])
    dispatch(updateEditedList({ id: collectionId, type, isEdited: true }))
    if (!keep) {
      dispatch(updateEditedList({ id: originId, type, isEdited: true }))
    }
  }

  useEffect(() => {
    setSelectedList([])
  }, [currentId])

  useEffect(() => {
    // console.log("🪝 selected list update", selectedList)
  }, [selectedList])

  return {
    selectedList,
    tabsByWindowMap,
    setSelectedList,
    onSelect,
    openSelected,
    deleteSelected,
    addSelectedToCollection
  }
}

export default useSeletedList
