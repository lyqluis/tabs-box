import { useEffect, useRef, useState } from "react"
import DragableIcon from "react:~assets/svg/dragable.svg"
import WindowIcon from "react:~assets/svg/window.svg"

import useOperations from "~tabs/hooks/useOperations"
import { openWindow } from "~tabs/utils/platform"

import { ListItem } from "."
import { useGlobalCtx } from "../context"
import { useDialog } from "../Dialog/DialogContext"
import { Sortable, useDndContext, useSortableItem } from "../Dnd"
import Icon from "../Icon"
import { removeWindow, updateEditedList } from "../reducers/actions"

interface ListProps {
  window: Window // from <windows[] | collection.windows[]>
  type?: "window" | "collection" // window | collection
  selectedMap?: any
  // selectedList?: chrome.tabs.Tab[]
  dispatchEdit?: (isEdited?: boolean) => void
  onSelect?: (any: any) => void
  setWindowTabs?: (id: WindowId, tabs: Tab[]) => void
}

// TODO any operation on the list should be push into history stack
const List: React.FC<ListProps> = ({
  window,
  type,
  selectedMap,
  onSelect,
  setWindowTabs
}) => {
  const [pinnedTabs, setPinnedTabs] = useState(
    window?.tabs?.filter((tab) => tab.pinned) ?? []
  )
  const [tabs, setTabs] = useState(
    window?.tabs?.filter((tab) => !tab.pinned) ?? []
  )
  const { current, dispatch } = useGlobalCtx()
  // console.log('List - @useDndContext', useDndContext())
  const { draggingItem } = useDndContext()
  const { openDialog } = useDialog()
  const { copy, paste } = useOperations()

  // console.log("List Component refreshed, props-window", window, tabs)

  const allCheckBox = useRef(null)
  const selectedList = selectedMap.get(window.id) ?? [] // otherwise multiList in sortable will fail

  const selectAll = (e) => {
    const selectedCount = selectedList.length
    if (selectedCount === window.tabs.length) {
      // remove all
      setWindowTabs(window.id, [])
    } else {
      // select all
      setWindowTabs(window.id, window.tabs)
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

  if ((!pinnedTabs || !pinnedTabs.length) && (!tabs || !tabs.length))
    return null

  return (
    <div
      className="relative text-clip p-5 pr-0"
      ref={setNodeRef}
      style={{
        background: "lightyellow",
        ...style,
        opacity: draggingItem?.id === window.id ? 0.5 : 1
      }}
    >
      {/* list operation */}
      <div
        className={`sticky top-0 mb-4 mt-4 flex h-5 items-center justify-start ${type === "window" ? "pl-5" : ""} pr-3`}
      >
        {/* draggable */}
        {type === "collection" && (
          <Icon
            Svg={DragableIcon}
            className="list-item__handle flex h-5 w-5 flex-none items-center justify-start fill-slate-300 hover:cursor-grab focus:cursor-grabbing focus:outline-none"
            {...attributes}
            {...listeners}
          />
        )}
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
          <Icon
            Svg={WindowIcon}
            className="h-full w-7 flex-none fill-slate-700"
          />
        )}
        <span className="ml-2 text-base font-bold">Window</span>
        {/* // todo: remove window.id */}
        {`: ${window.id}`}
        {/* quick action */}
        {type === "collection" && (
          <>
            <button className="btn btn-xs m-1" onClick={() => void 0}>
              copy
            </button>
            <button className="btn btn-xs m-1" onClick={() => paste(window)}>
              paste
            </button>
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
      <Sortable list={tabs} listId={window.id}>
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
