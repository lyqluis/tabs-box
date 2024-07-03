import { useEffect, useRef, useState } from "react"

import useSeletedList from "~tabs/hooks/useSelect"
import { openTabs } from "~tabs/utils/platform"

import { ListItem } from "."
import { useGlobalCtx } from "../context"
import { useDialog } from "../Dialog/DialogContext"
import { removeTab, setCollection, setWindow } from "../reducers/actions"
import { Sortable } from "./Sortable"

const listIndexShift = (arr, from, to) => {
  const direction = from < to ? 1 : -1
  const step = direction === 1 ? 1 : -1

  const target = arr[from]
  for (let i = from; i !== to; i += step) {
    arr[i] = arr[i + step]
  }
  arr[to] = target
  return arr
}

interface ListProps {
  window: chrome.windows.Window // from <windows[] | collection.windows[]>
  type?: string // window | collection
  dispatchEdit?: (isEdited?: boolean) => void
}

// TODO any operation on the list should be push into history stack
const List: React.FC<ListProps> = ({ window, type, dispatchEdit }) => {
  const [pinnedTabs, setPinnedTabs] = useState(
    window?.tabs?.filter((tab) => tab.pinned) ?? []
  )
  const [tabs, setTabs] = useState(
    window?.tabs?.filter((tab) => !tab.pinned) ?? []
  )
  const {
    state: { current },
    dispatch
  } = useGlobalCtx()
  const { selectedList, setSelectedList } = useSeletedList(current.id)
  const { openDialog } = useDialog()

  console.log("List Component refreshed, props-window", window, tabs)

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
  }

  const allCheckBox = useRef(null)
  // const hasSelectedItem = selectedList.some((tab) => tab.windowId === window.id)
  const selectedItemCount = selectedList.reduce((acc, tab) => {
    if (tab.windowId === window.id) acc++
    return acc
  }, 0)
  const selectAll = (e) => {
    console.log("select all")
    const selectedCount = selectedList.length
    if (selectedCount === window.tabs.length) {
      // remove all
      setSelectedList([])
    } else {
      // select all
      setSelectedList([...window.tabs])
    }
  }
  const openSelected = () => {
    // TODO if select a window, open a new window
    openTabs(selectedList)
    setSelectedList([])
  }
  const deleteSelected = () => {
    if (type === "collection") {
      // collection's tab
      // use [save] button to delete from local
      const newTabs = tabs.filter((tab) => !selectedList.includes(tab))
      console.log("delete selected list, new tabs", newTabs)

      const newWindow = { ...window, tabs: newTabs }
      const insertIdx = current.windows.findIndex((w) => w.id === newWindow.id)
      if (insertIdx > -1) {
        // create new collection
        current.windows.splice(insertIdx, 1, newWindow)
        dispatch(setCollection(current))
      }
    } else {
      // window's tab, delete from reducer
      // use [apply] button to update window
      selectedList.map((tab) => dispatch(removeTab(tab.id, tab.windowId)))
    }
    // TODO type is window/collection.window
    setSelectedList([])
    dispatchEdit(true)
  }

  useEffect(() => {
    const selectCount = selectedList.length
    if (!allCheckBox.current) return
    if (selectCount > 0 && selectCount < window.tabs.length) {
      allCheckBox.current.indeterminate = true
    } else {
      allCheckBox.current.indeterminate = false
    }
  }, [selectedList])

  useEffect(() => {
    console.log("effect in List, window changes")

    setPinnedTabs(window?.tabs?.filter((tab) => tab.pinned))
    setTabs(window?.tabs?.filter((tab) => !tab.pinned))
  }, [window])

  // update tabs to the reducer
  const onSortEnd = (tabs) => {
    // param is newest list from sortable, since can't get newest list at the moment
    // console.log("on sort end", tabs)
    const newWindow = { ...window, tabs: [...pinnedTabs, ...tabs] }
    if (type === "collection") {
      // current is collection
      const insertIdx = current.windows.findIndex((w) => w.id === newWindow.id)
      if (insertIdx > -1) {
        // update existed collection's windows
        current.windows.splice(insertIdx, 1, newWindow)
        dispatch(setCollection(current))
      }
    } else {
      // current is window
      dispatch(setWindow(newWindow))
    }
    dispatchEdit(true)
  }

  if ((!pinnedTabs || !pinnedTabs.length) && (!tabs || !tabs.length)) return

  return (
    <div className="relative text-clip p-5">
      {/* list operation */}
      <div className="sticky top-0 mb-4 mt-4 flex h-5 items-center justify-start pl-5">
        {selectedItemCount > 0 && (
          <label className="label mr-3 cursor-pointer">
            <input
              ref={allCheckBox}
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={selectedItemCount === window.tabs.length}
              onChange={selectAll}
            />
          </label>
        )}
        Window: {window.id}
        {selectedItemCount > 0 && (
          <div className="btn-wrapper ml-auto flex">
            {type === "collection" && (
              <button className="btn btn-xs m-1" onClick={openSelected}>
                open selected
              </button>
            )}
            <button className="btn btn-xs m-1" onClick={deleteSelected}>
              {type === "collection" ? "remove selected" : "close selected"}
            </button>
          </div>
        )}
      </div>
      {/* pinned tabs */}
      {pinnedTabs.map((tab, i) => {
        return (
          <ListItem
            tab={tab}
            key={`${window.id}-${tab.url}-${i}`}
            checked={selectedList.includes(tab)}
            onSelect={onSelect}
            type={type}
          ></ListItem>
        )
      })}
      {/* sortable tabs */}
      <Sortable
        list={tabs}
        setList={setTabs}
        multiList={selectedList}
        onSortEnd={onSortEnd}
      >
        {tabs.map((tab, i) => {
          return (
            <ListItem
              tab={tab}
              key={`${window.id}-${tab.url}-${i}`}
              checked={selectedList.includes(tab)}
              onSelect={onSelect}
              type={type}
            ></ListItem>
          )
        })}
      </Sortable>
    </div>
  )
}

export default List
