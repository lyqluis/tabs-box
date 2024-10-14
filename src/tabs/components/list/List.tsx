import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useMemo, useRef, useState } from "react"
import WindowIcon from "react:~assets/svg/window.svg"

import { openWindow } from "~tabs/utils/platform"

import { ListItem } from "."
import { useGlobalCtx } from "../context"
import { useDialog } from "../Dialog/DialogContext"
import { Draggable } from "../Dnd"
import {
  removeWindow,
  setCollection,
  setWindow,
  updateEditedList
} from "../reducers/actions"
import { Sortable, useSortableItem } from "./Sortable"

interface ListProps {
  window: Window // from <windows[] | collection.windows[]>
  type?: "window" | "collection" // window | collection
  selectedMap?: any
  // selectedList?: chrome.tabs.Tab[]
  dispatchEdit?: (isEdited?: boolean) => void
  onSelect?: (any: any) => void
  setWindowTabs?: (id: WindowId, isSelected: boolean) => void
}

// TODO any operation on the list should be push into history stack
const List: React.FC<ListProps> = ({
  window,
  type,
  selectedMap,
  onSelect,
  dispatchEdit,
  setWindowTabs
}) => {
  const [pinnedTabs, setPinnedTabs] = useState(
    window?.tabs?.filter((tab) => tab.pinned) ?? []
  )
  const [tabs, setTabs] = useState(
    window?.tabs?.filter((tab) => !tab.pinned) ?? []
  )
  const { current, dispatch } = useGlobalCtx()
  const { openDialog } = useDialog()

  // console.log("List Component refreshed, props-window", window, tabs)

  const allCheckBox = useRef(null)
  const selectedList = selectedMap.get(window.id) ?? [] // otherwise multiList in sortable will fail

  const selectAll = (e) => {
    const selectedCount = selectedList.length
    if (selectedCount === window.tabs.length) {
      // remove all
      setWindowTabs(window.id, false)
    } else {
      // select all
      setWindowTabs(window.id, true)
    }
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

  const { attributes, listeners, setNodeRef, style } = useSortableItem({
    id: window.id
  })

  // update tabs to the reducer
  const onTabSortEnd = (tabs) => {
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
    <div
      className="relative text-clip p-5"
      // style={{ background: "lightyellow" }}
      ref={setNodeRef}
      style={{ background: "lightyellow", ...style }}
    >
      <button {...listeners} {...attributes}>
        drag handle
      </button>
      {/* list operation */}
      <div className="sticky top-0 mb-4 mt-4 flex h-5 items-center justify-start pl-5">
        {selectedList.length > 0 ? (
          <label className="label cursor-pointer">
            <input
              ref={allCheckBox}
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={selectedList.length === window.tabs.length}
              onChange={selectAll}
            />
          </label>
        ) : (
          <WindowIcon className="h-full w-7 fill-slate-700"></WindowIcon>
        )}
        <span className="ml-2 text-base font-bold">Window</span>
        {/* // todo: remove window.id */}
        {`: ${window.id}`}
        {/* quick action*/}
        {type === "collection" && (
          <>
            <button
              className="btn btn-xs m-1"
              onClick={() => openWindow(window)}
            >
              open window
            </button>
            <button
              className="btn btn-xs m-1"
              onClick={() => {
                dispatch(
                  removeWindow({
                    windowId: window.id,
                    collectionId: current.id
                  })
                )
                // edit recorder
                dispatch(
                  updateEditedList({
                    id: current.id,
                    type: "collection",
                    isEdited: true
                  })
                )
              }}
            >
              delete window
            </button>
          </>
        )}
      </div>
      {/* tabs */}
      <Sortable
        list={tabs}
        setList={setTabs}
        multiList={selectedList}
        onSortEnd={onTabSortEnd}
        listId={window.id}
      >
        {/* pinned tabs */}
        {pinnedTabs.map((tab, i) => {
          return !tab.hidden ? (
            <ListItem
              tab={tab}
              key={`${window.id}-${tab.url}-${i}`}
              checked={selectedList?.some((t) => tab.id === t.id)}
              onSelect={onSelect}
              type={type}
            ></ListItem>
          ) : null
        })}
        {/* non-pinned tabs */}
        {tabs.map((tab, i) => {
          return !tab.hidden ? (
            <ListItem
              tab={tab}
              key={`${window.id}-${tab.url}-${i}`}
              checked={selectedList?.some((t) => tab.id === t.id)}
              onSelect={onSelect}
              type={type}
            ></ListItem>
          ) : null
        })}
      </Sortable>
    </div>
  )
}

export default List
