import { useEffect, useRef, useState } from "react"
import { ReactSortable } from "react-sortablejs"

import { openTabs } from "~tabs/utils/platform"

import { ListItem } from "."
import { useGlobalCtx } from "../context"
import { useDialog } from "../Dialog/DialogContext"
import {
  removeTab,
  setCollection,
  setSelectedList,
  setWindow
} from "../reducers/actions"

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
  const [tabs, setTabs] = useState(window?.tabs ?? [])
  const {
    state: { current, selectedList },
    dispatch
  } = useGlobalCtx()
  const { openDialog } = useDialog()

  console.log("List Component refreshed, props-window", window, tabs)

  const onSelect = ({ tab, isSelected }) => {
    if (isSelected) {
      // add
      const existed = selectedList.find((t) => t.url === tab.url)
      if (existed) return
      dispatch(setSelectedList([...selectedList, tab]))
    } else {
      // remove
      dispatch(setSelectedList(selectedList.filter((t) => t.url !== tab.url)))
    }
  }

  const allCheckBox = useRef(null)
  const selectAll = (e) => {
    console.log("select all")
    const selectedCount = selectedList.length
    if (selectedCount === window.tabs.length) {
      // remove all
      dispatch(setSelectedList([]))
    } else {
      // select all
      dispatch(setSelectedList([...window.tabs]))
    }
  }
  const openSelected = () => {
    openTabs(selectedList)
    dispatch(setSelectedList([]))
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
    dispatch(setSelectedList([]))
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
    setTabs(window.tabs)
  }, [window])

  // update tabs to the reducer
  const onSortEnd = (e) => {
    // old index -> new index
    const { oldIndex, newIndex } = e
    listIndexShift(tabs, oldIndex, newIndex)
    const newWindow = { ...window, tabs: tabs }
    if (current.created) {
      // current is collection
      const insertIdx = current.windows.findIndex((w) => w.id === newWindow.id)
      if (insertIdx > -1) {
        // create new collection
        current.windows.splice(insertIdx, 1, newWindow)
        dispatch(setCollection(current))
      }
    } else {
      // current is window
      dispatch(setWindow(newWindow))
    }
    dispatchEdit(true)
  }

  if (!tabs || !tabs.length) return

  return (
    <div className="relative text-clip p-5">
      <div className="sticky top-0 mb-4 mt-4 flex h-5 items-center justify-start pl-5">
        {selectedList.length > 0 && (
          <label className="label mr-3 cursor-pointer">
            <input
              ref={allCheckBox}
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={selectedList.length === window.tabs.length}
              onChange={selectAll}
            />
          </label>
        )}
        Window: {window.id}
        {selectedList.length > 0 && (
          <div className="btn-wrapper ml-auto flex">
            <button className="btn btn-xs m-1" onClick={openSelected}>
              open selected
            </button>
            <button className="btn btn-xs m-1" onClick={deleteSelected}>
              remove selected
            </button>
          </div>
        )}
      </div>
      <ReactSortable
        tag="ul"
        list={tabs}
        setList={setTabs}
        handle=".list-item__handle"
        onEnd={onSortEnd}
      >
        {tabs.map((tab, i) => {
          return (
            <ListItem
              tab={tab}
              key={`${tab.url}-${i}`}
              checked={selectedList.includes(tab)}
              onSelect={onSelect}
            ></ListItem>
          )
        })}
      </ReactSortable>
    </div>
  )
}

export default List
