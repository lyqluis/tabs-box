import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { createContext, useContext, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { useSelectContext } from "~tabs/hooks/useSelect"

import { useGlobalCtx } from "./context"
import { OverlayListItem } from "./list/ListItem"

const ctx = createContext(null)
const { Provider } = ctx
export const useDndContext = () => useContext(ctx)

// Droppable
// wrapper the SideBar Item
export const Droppable = ({ item = null, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: item?.id ?? "area"
  })

  return (
    <div ref={setNodeRef} style={{ background: isOver ? "orange" : "" }}>
      {children}
    </div>
  )
}

export const DndGlobalContext = ({ children }) => {
  const [draggingItem, setDraggingItem] = useState(null)
  const [draggingCount, setDraggingCount] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor)
    // ? is keydown event necessary
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates
    // })
  )

  const {
    state: { collections, windows }
  } = useGlobalCtx()
  // get window's selected list
  const { tabsByWindowMap, setSelected } = useSelectContext()
  const windowId = draggingItem?.windowId ?? 0
  const selectedWindowTabs = tabsByWindowMap.get(windowId)
  const selectedWindowTabsCount = selectedWindowTabs?.length ?? 0

  const handleDragStart = ({ active }) => {
    // get dragging tab id & window id
    const tabId = active.id
    const windowId = active.data?.current?.sortable?.containerId
    if (!tabId || !windowId) return

    const selectedWindowTabs = tabsByWindowMap.get(windowId)
    const selectedWindowTabsCount = selectedWindowTabs?.length ?? 0
    console.log("🖱️ on drag start", active, windowId, selectedWindowTabs)

    // TODO get dragging element'width to set width
    // find dragging tab to set draggingItem for drag overlay
    let findDragging
    for (const window of windows) {
      const targetTab = window.tabs.find((t) => t.id === tabId)
      if (targetTab) {
        setDraggingItem(targetTab)
        findDragging = true
        break
      }
    }
    if (!findDragging) {
      for (const collection of collections) {
        const window = collection.windows.find((w) => w.id === windowId)
        if (!window) continue
        const targetTab = window.tabs.find((t) => t.id === tabId)
        if (targetTab) {
          setDraggingItem(targetTab)
          break
        }
      }
    }

    // TODO if selected list length > 1, change layout style to multiple
    // calculate y-offset only if the item is alreay selected
    // select the item if it's not selected

    // hide other selected items if necessary (exclude dragging tab)
    if (
      selectedWindowTabsCount &&
      selectedWindowTabs.some((t) => t.id === tabId)
    ) {
      setSelected({ hidden: true }, windowId, (tab) => tab.id !== tabId)
      setDraggingCount(selectedWindowTabsCount)
    } else {
      setDraggingCount(1)
    }
  }
  const handleDragOver = (e) => {
    console.log("🖱️ on drag over", e)
  }
  const handleDragEnd = ({ active }) => {
    console.log("🖱️ on drag end", active)
    setDraggingItem(null)
    // make selected items hidden in drag start visible
    if (selectedWindowTabsCount) {
      setSelected({ hidden: false }, windowId)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      // todo customize detection
      // collisionDetection={collisionDetectionStrategy} // DO NOT use default - rectangle intersection, since it will let styled of draggable item outside droppabel container disappear
      collisionDetection={closestCenter} // DO NOT use default - rectangle intersection, since it will let styled of draggable item outside droppabel container disappear
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Provider value={{ draggingItem, setDraggingItem }}>
        {children}
        <DragOverlay>
          <OverlayListItem count={draggingCount}></OverlayListItem>
        </DragOverlay>
      </Provider>
    </DndContext>
  )
}
