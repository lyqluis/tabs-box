import "../../style"

import { useEffect, useState } from "react"
import { ReactSortable } from "react-sortablejs"

import { ListItem } from "."
import { useGlobalCtx } from "../context"
import {
  setCollection,
  setCurrent,
  setSelectedList,
  setWindow
} from "../reducer/actions"

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
}

const List: React.FC<ListProps> = ({ window }) => {
  const [tabs, setTabs] = useState(window?.tabs ?? window?.links ?? [])
  const {
    state: { current, selectedList },
    dispatch
  } = useGlobalCtx()

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

  useEffect(() => {
    setTabs(window.tabs ?? window.links)
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
        dispatch(setCurrent(current))
      }
    } else {
      // current is window
      dispatch(setWindow(newWindow))
      dispatch(setCurrent(newWindow))
    }
  }

  if (!tabs || !tabs.length) return

  return (
    <div className="p-5 text-clip">
      <h1>Window: {window.focused ? "current" : window.id}</h1>
      {selectedList.length > 0 && (
        <h1>{selectedList.length} tabs is selected</h1>
      )}
      <ReactSortable
        tag="ul"
        list={tabs}
        setList={setTabs}
        handle=".list-item__handle"
        onEnd={onSortEnd}>
        {tabs.map((tab, i) => {
          return (
            <ListItem
              tab={tab}
              key={`${tab.url}-${i}`}
              checked={selectedList.includes(tab)}
              onSelect={onSelect}></ListItem>
          )
        })}
      </ReactSortable>
    </div>
  )
}

export default List
