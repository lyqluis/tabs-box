import { useEffect, useMemo, useState } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import { removeTab, setCollection } from "~tabs/components/reducers/actions"
import { openTabs } from "~tabs/utils/platform"

// select several tabs in several windows of collections
const useSeletedList = (currentId, type, dispatchEdit) => {
  const {
    state: { current, collections },
    dispatch
  } = useGlobalCtx()

  const [selectedList, setSelectedList] = useState([])
  const tabsByWindowInfo = useMemo(() => {
    return selectedList.reduce((map, tab) => {
      if (!map[tab.windowId]) map[tab.windowId] = []
      map[tab.windowId].push(tab)
      return map
    }, {})
  }, [selectedList])
  console.log("tabs grouped by window", tabsByWindowInfo)

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
    if (type === "collection") {
      // collection's tab
      // should use [save] button to delete from local later
      const collection = current
      const windows = collection.windows.map((window) => {
        const tabsByWindow = tabsByWindowInfo[window.id]
        if (tabsByWindow.length) {
          const newTabs = window.tabs.filter(
            (tab) => !tabsByWindow.includes(tab)
          )
          // copy a new window object
          return { ...window, tabs: newTabs }
        }
        return window
      })
      collection.windows = windows
      dispatch(setCollection(collection))
    } else {
      // window's tab
      // should use [apply] button to update window later
      selectedList.map((tab) => dispatch(removeTab(tab.id, tab.windowId)))
    }
    // TODO type is window/collection.window
    setSelectedList([])
    dispatchEdit(true)
  }

  // todo move with windowId changed
  const addSelectedToCollection = (collectionId, copied = false) => {
    const originCollection = current
    const targetCollection = collections.find((c) => c.id === collectionId)
    const collection = { ...targetCollection } // copy a new collection
    // default save selected tabs to target colletion.windows[0]
    const targetWindows = collection.windows
    const targetWindow = collection.windows[0]
    targetWindow.tabs.unshift(...selectedList)
    // save as new windows
    collection.windows = [...targetWindows]
    // save as new collection
    dispatch(setCollectionWithLocalStorage(collection))
    // if not copied, remove selected tab from origin collection.window
    if (!copied) {
      const copiedWindows = [...originCollection.windows]
      const windowIndex = originCollection.windows.findIndex(
        (w) => w.id === window.id
      )
      const originWindow = originCollection.windows[windowIndex]
      const copiedWindow = { ...originWindow }
      copiedWindow.tabs = copiedWindow.tabs.filter(
        (tab) => !selectedList.some((t) => t.id === tab.id)
      )
      copiedWindows[windowIndex] = copiedWindow
      originCollection.windows = copiedWindows
      dispatch(setCollectionWithLocalStorage(originCollection))
    }
    // reset selectes list
  }

  useEffect(() => {
    setSelectedList([])
  }, [currentId])

  useEffect(() => {
    // console.log("🪝 selected list update", selectedList)
  }, [selectedList])

  return {
    selectedList,
    tabsByWindowInfo,
    setSelectedList,
    onSelect,
    openSelected,
    deleteSelected
  }
}

export default useSeletedList
