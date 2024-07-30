import { useEffect, useMemo, useRef, useState } from "react"

import { ListItem } from "."
import { useGlobalCtx } from "../context"
import { useDialog } from "../Dialog/DialogContext"
import { setCollection, setWindow } from "../reducers/actions"
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
  dispatchEdit,
  setWindowTabs
}) => {
  const [pinnedTabs, setPinnedTabs] = useState(
    window?.tabs?.filter((tab) => tab.pinned) ?? []
  )
  const [tabs, setTabs] = useState(
    window?.tabs?.filter((tab) => !tab.pinned) ?? []
  )
  const {
    state: { current, collections },
    dispatch
  } = useGlobalCtx()

  const { openDialog } = useDialog()

  console.log("List Component refreshed, props-window", window, tabs)

  // TODO all select check box
  // maybe no need selectedList prop, just need list in selectedMap's selected list
  const allCheckBox = useRef(null)
  const selectedList = selectedMap.get(window.id) ?? [] // otherwise multiList in sortable will fail

  const selectAll = (e) => {
    const selectedCount = selectedList.length
    if (selectedCount === window.tabs.length) {
      // remove all
      setWindowTabs(window.id, [])
    } else {
      // select all
      setWindowTabs(window.id, [...window.tabs])
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
    <div
      className="relative text-clip p-5"
      style={{ background: "lightyellow" }}
    >
      {/* list operation */}
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
      </div>
      {/* tabs */}
      <Sortable
        list={tabs}
        setList={setTabs}
        multiList={selectedList}
        onSortEnd={onSortEnd}
        listId={window.id}
      >
        {/* pinned tabs */}
        {pinnedTabs.map((tab, i) => {
          return (
            <ListItem
              tab={tab}
              key={`${window.id}-${tab.url}-${i}`}
              checked={selectedList?.some((t) => tab.id === t.id)}
              onSelect={onSelect}
              type={type}
            ></ListItem>
          )
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
