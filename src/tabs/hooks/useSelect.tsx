import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  addTabs,
  removeTabs,
  updateEditedList,
  updateTabs
} from "~tabs/components/reducers/actions"
import { openTabs } from "~tabs/utils/platform"

const ctx = createContext(null)
const { Provider } = ctx

// TODO check all tabs box
export const oldSelectProvider = ({ children }) => {
  const {
    state: { current, currentId, collections },
    type,
    dispatch
  } = useGlobalCtx()

  const [selectedList, setSelectedList] = useState([])

  const tabsByWindowMap = useMemo<Map<WindowId, Tab[]>>(() => {
    return selectedList.reduce((map, tab) => {
      if (!map.has(tab.windowId)) map.set(tab.windowId, [])
      map.get(tab.windowId).push(tab)
      return map
    }, new Map())
  }, [selectedList])

  console.log(
    "🪝 useSelect - @selected list",
    selectedList,
    "@tabs grouped by window",
    tabsByWindowMap
  )

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

  const setTabsByWindow = (windowId, tabs: Tab[]) => {
    setSelectedList((list) => {
      const restList = list.filter((tab) => tab.windowId !== windowId)
      return [...restList, ...tabs]
    })
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

  /**
   * @func: set props in selected tabs, like `hidden: true`
   * @param {Object} props {hidden: true}
   * @param {Sting|Number} windowId
   * @param {function} filter () => boolean
   */
  const setSelected = (
    props: object,
    windowId?: WindowId,
    filter?: () => boolean
  ) => {
    const collectionId = type === "collection" ? current.id : ""

    if (windowId) {
      // set single target window's selected tabs
      let tabs = tabsByWindowMap.get(windowId)
      if (filter) {
        tabs = tabs.filter(filter)
      }
      const newTabs = tabs.map((tab) => ({ ...tab, ...props }))
      dispatch(updateTabs({ tabs: newTabs, windowId, collectionId }))
    } else {
      // set all selected tabs
      tabsByWindowMap.forEach((tabs, windowId) => {
        const newTabs = tabs.map((tab) => ({ ...tab, ...props }))
        dispatch(updateTabs({ tabs: newTabs, windowId, collectionId }))
      })
    }
  }

  const addSelectedToCollection = (collectionId, keep = false) => {
    console.log("add selected to collection", collectionId)

    const originId = type === "collection" ? current.id : ""
    const collection = collections.find((c) => c.id === collectionId)
    const targetWindowId = collection.windows[0].id
    tabsByWindowMap.forEach((tabs, windowId) => {
      dispatch(
        addTabs({
          tabs,
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

  // useEffect(() => {
  //   console.log("🪝 selected list update", selectedList)
  // }, [selectedList])

  return (
    <Provider
      value={{
        selectedList,
        tabsByWindowMap,
        setSelectedList,
        setTabsByWindow,
        onSelect,
        openSelected,
        setSelected,
        deleteSelected,
        addSelectedToCollection
      }}
    >
      {children}
    </Provider>
  )
}

export const useSelectContext = () => useContext(ctx)

// TODO: [refactor] change to state, do not use tab.checked
export const SelectProvider = ({ children }) => {
  const {
    state: { currentId, windows, collections },
    current,
    type,
    dispatch
  } = useGlobalCtx()

  const [selectedList, setSelectedList] = useState([])

  useEffect(() => {
    setSelectedList((list) => {
      if (!current) return []
      if (type === "window") {
        return current.tabs.filter((t) => t.checked)
      } else {
        return current.windows.reduce(
          (checkedTabs, window) => [
            ...checkedTabs,
            ...window.tabs.filter((t) => t.checked)
          ],
          []
        )
      }
    })
  }, [windows, collections, current])

  const tabsByWindowMap = useMemo<Map<WindowId, Tab[]>>(() => {
    return selectedList.reduce((map, tab) => {
      if (!map.has(tab.windowId)) map.set(tab.windowId, [])
      map.get(tab.windowId).push(tab)
      return map
    }, new Map())
  }, [selectedList])

  console.log(
    "🪝 useSelect - @selected list",
    selectedList,
    "@tabs grouped by window map",
    tabsByWindowMap
  )

  const onSelect = ({ tab, isSelected }) => {
    tab.checked = isSelected
    const collectionId = type === "collection" ? currentId : undefined
    dispatch(
      updateTabs({ tabs: selectedList, windowId: tab.windoId, collectionId })
    )
    console.log("on select", tab, type, selectedList)
  }

  const setTabsByWindow = (windowId, isSelected) => {
    const collectionId = type === "collection" ? currentId : undefined
    // get target window through window id
    const tabs =
      current.tabs ?? current.windows.find((w) => w.id === windowId).tabs
    const windowSelectedTabs = tabs.map((tab) => {
      tab.checked = isSelected
      return tab
    })
    dispatch(
      updateTabs({
        tabs: windowSelectedTabs,
        windowId,
        collectionId
      })
    )
  }

  const openSelected = () => {
    openTabs(selectedList)
    const collectionId = type === "collection" ? currentId : undefined
    tabsByWindowMap.forEach((tabs, windowId) => {
      const unSelectedTabs = tabs.map((tab) => {
        tab.checked = false
        return tab
      })
      dispatch(
        updateTabs({
          tabs: unSelectedTabs,
          windowId,
          collectionId
        })
      )
    })
  }

  // delete from reducer
  const deleteSelected = () => {
    const collectionId = type === "collection" ? current.id : undefined
    tabsByWindowMap.forEach((tabs, windowId) => {
      const tabIds = tabs.map((tab) => tab.id)
      dispatch(removeTabs({ tabIds, windowId, collectionId }))
    })
    // TODO type is window/collection.window
    dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
  }

  /**
   * @func: set some props to selected tabs, like `hidden: true`
   * @param {Object} props {hidden: true}
   * @param {Sting|Number} windowId
   * @param {function} filter () => boolean
   */
  const setSelected = (
    props: object,
    windowId?: WindowId,
    filter?: () => boolean
  ) => {
    const collectionId = type === "collection" ? current.id : ""

    if (windowId) {
      // set single target window's selected tabs
      let tabs = tabsByWindowMap.get(windowId)
      if (filter) {
        tabs = tabs.filter(filter)
      }
      const newTabs = tabs.map((tab) => ({ ...tab, ...props }))
      dispatch(updateTabs({ tabs: newTabs, windowId, collectionId }))
    } else {
      // set all selected tabs
      tabsByWindowMap.forEach((tabs, windowId) => {
        const newTabs = tabs.map((tab) => ({ ...tab, ...props }))
        dispatch(updateTabs({ tabs: newTabs, windowId, collectionId }))
      })
    }
  }

  const addSelectedToCollection = (collectionId, keep = false) => {
    console.log("add selected to collection", collectionId)

    const originId = type === "collection" ? current.id : ""
    const collection = collections.find((c) => c.id === collectionId)
    const targetWindowId = collection.windows[0].id
    tabsByWindowMap.forEach((tabs, windowId) => {
      dispatch(
        addTabs({
          tabs,
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
    dispatch(updateEditedList({ id: collectionId, type, isEdited: true }))
    if (!keep) {
      dispatch(updateEditedList({ id: originId, type, isEdited: true }))
    }
  }

  return (
    <Provider
      value={{
        selectedList,
        tabsByWindowMap,
        setSelectedList,
        setTabsByWindow,
        onSelect,
        openSelected,
        setSelected,
        deleteSelected,
        addSelectedToCollection
      }}
    >
      {children}
    </Provider>
  )
}
