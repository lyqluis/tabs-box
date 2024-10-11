import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { createContext, useCallback, useContext, useState } from "react"
import { createPortal } from "react-dom"

import { useSelectContext } from "~tabs/hooks/useSelect"
import { createWindow } from "~tabs/utils/window"

import { useGlobalCtx } from "./context"
import { OverlayListItem } from "./list/ListItem"
import {
  addTabs,
  addWindow,
  removeTabs,
  updateEditedList,
  updateTabs
} from "./reducers/actions"

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
  const [dragState, setDragState] = useState({
    originContainerId: null
  })
  const [originContainerId, setOriginContainerId] = useState(null)
  const [draggingCount, setDraggingCount] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor)
    // ? is keydown event necessary
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates
    // })
  )

  const {
    state: { collections, windows },
    current,
    type,
    dispatch
  } = useGlobalCtx()
  // get window's selected list
  const { tabsByWindowMap, setSelected, selectedList } = useSelectContext()
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

    // find dragging tab to set draggingItem for drag overlay
    let findDragging
    for (const window of windows) {
      const targetTab = window.tabs.find((t) => t.id === tabId)
      if (targetTab) {
        setDraggingItem(targetTab)
        setOriginContainerId(targetTab.windowId)
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
          setOriginContainerId(targetTab.windowId)
          break
        }
      }
    }

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

  // TODO
  const handleDragOver = (e) => {
    console.log("🖱️ on drag over", e)
    const { active, over } = e
    if (!active || !over) return
    const activeId = active.id
    const overId = over.id

    const activeContainerId = draggingItem.windowId ?? draggingItem.collectionId // since active.data?.current?.sortable?.containerId will change after set to the new window during the drag over event
    const overContainerId = over.data?.current?.sortable?.containerId
    console.log(
      "--- on drag over",
      activeId,
      overId,
      activeContainerId,
      overContainerId
    )

    // * active & over is in the same list
    if (activeContainerId === overContainerId) return

    // * active is tab, over is sidebar item, do nothing
    if (!overContainerId) {
      return
    }

    const windowId = active.data?.current?.sortable?.containerId
    const selectedWindowTabs = tabsByWindowMap.get(activeContainerId)
    const selectedWindowTabsCount = selectedWindowTabs?.length ?? 0

    // * active is tab, over is tab in the different list
    // * witch only happens in the same collection.
    // set active tab to the over tab's list
    // single drag
    let tabIds = [activeId]
    let tabs = [draggingItem]
    // multi drag
    if (
      selectedWindowTabsCount &&
      selectedWindowTabs.some((t) => t.id === activeId)
    ) {
      tabIds = selectedWindowTabs.map((tab) => tab.id)
      tabs = selectedWindowTabs
    }
    dispatch(
      removeTabs({
        tabIds,
        windowId: activeContainerId,
        collectionId: current.id
      })
    )
    dispatch(
      addTabs({
        tabs,
        windowId: overContainerId,
        collectionId: current.id
      })
    )
  }

  // TODO
  const handleDragEnd = ({ active, over }) => {
    console.log("🖱️ on drag end", active, over)

    const activeId = active.id
    const overId = over.id

    const activeContainerId = draggingItem.windowId ?? draggingItem.collectionId // since active.data?.current?.sortable?.containerId will change after set to the new window during the drag over event
    const overContainerId = over.data?.current?.sortable?.containerId

    // single drag
    let tabIds = [activeId]
    let tabs = [draggingItem]
    // multi drag
    const selectedWindowTabs = tabsByWindowMap.get(activeContainerId)
    const selectedWindowTabsCount = selectedWindowTabs?.length ?? 0
    if (
      selectedWindowTabsCount &&
      selectedWindowTabs.some((t) => t.id === activeId)
    ) {
      tabIds = selectedWindowTabs.map((tab) => tab.id)
      tabs = selectedWindowTabs
    }

    if (activeContainerId === overContainerId) {
      // * active is tab, over is tab in the other list (since active's container id is changed in drag over)
      // * & active is tab, over is tab in the same list
      console.log("active is tab, over is tab")

      // active is tab in the index of new order
      if (activeId !== overId) {
        const newIndex = over?.data?.current?.sortable?.index
        dispatch(
          updateTabs({
            tabs,
            windowId: activeContainerId,
            collectionId: current.id,
            index: newIndex
          })
        )
      }
      dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
    } else {
      // * active is tab
      if (!overId) return

      if (typeof overId === 'number') {
        // * over is window in sidebar
        console.log("active is tab, over is sidebar window")
        // no need to remove tab, add tabs to target window
        dispatch(
          addTabs({
            tabs,
            windowId: overId
          })
        )

        dispatch(
          updateEditedList({ id: overId, type: "window", isEdited: true })
        )
      } else {
        // * over is collection in sidebar
        console.log('active is tab, over is sidebar collection');
        // remove tabs from active window
        dispatch(
          removeTabs({
            tabIds,
            windowId: activeContainerId,
            collectionId: current.id
          })
        )
        // create new window with tabs in the target collection
        const newWindow = createWindow(tabs, overId)
        dispatch(addWindow({ window: newWindow, collectionId: overId }))

        dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
        dispatch(
          updateEditedList({ id: overId, type: "collection", isEdited: true })
        )
      }
    }

    // make selected items hidden in drag start visible
    if (selectedWindowTabsCount) {
      // need to set both tabs in active tab & over tab's window
      setSelected({ hidden: false })
    }

    setDraggingItem(null)
  }

  /**
   * TODO Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy = useCallback(
    (args) => {
      // find any intersecting droppable
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args)

      // console.log("💥 intersections", intersections)

      // if intersections includes sidebar item, return side bar item
      const sideBar =
        intersections.find((intersection) =>
          windows.some((w) => w.id === intersection.id)
        ) ??
        intersections.find((intersection) =>
          collections.some((c) => c.id === intersection.id)
        )
      if (sideBar) return [sideBar]
      // DO NOT use default - rectangle intersection
      // Since it will let styled of draggable item outside droppabel container disappear
      return closestCenter({ ...args })
    },
    [draggingItem]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
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
