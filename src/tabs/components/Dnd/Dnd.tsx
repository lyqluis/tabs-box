import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { createContext, useCallback, useContext, useState } from "react"

import { useSelectContext } from "~tabs/contexts/selectContext"
import { createWindow } from "~tabs/utils/window"

import { useGlobalCtx } from "../context"
import {
  addTabs,
  addWindow,
  removeTabs,
  removeWindow,
  setWindow,
  updateEditedList,
  updateTabs,
  updateWindow
} from "../reducers/actions"
import { OverlayList } from "./Overlay"

const ctx = createContext(null)
const { Provider } = ctx
export const useDndContext = () => useContext(ctx)

/**
 * Droppable
 * wrapper the SideBar Item
 */
export const Droppable = ({ item = null, className, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: item?.id ?? "area"
  })

  const droppableOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "oklch(var(--p))",
    opacity: 0.5,
    pointerEvents: "none" as React.CSSProperties["pointerEvents"], // 穿透遮罩层，允许点击下方的子组件
    display: isOver ? "block" : "none"
  }

  return (
    <div
      ref={setNodeRef}
      className={className + " relative"}
      style={{
        border: "2px solid transparent",
        borderColor: isOver ? "oklch(var(--p))" : "transparent"
      }}
    >
      {children}
      {/* droppable overlay */}
      <div style={droppableOverlayStyle}></div>
    </div>
  )
}

/**
 * Draggable
 * make window in the collection draggable to sidebar item
 */
export const Draggable = ({ window = null, className, style, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: window?.id
  })
  const transStyle = {
    ...style,
    transform: CSS.Translate.toString(transform)
  }

  return (
    <div
      ref={setNodeRef}
      style={transStyle}
      className={className}
      {...listeners}
      {...attributes}
    >
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
    // get dragging item id & container id
    const activeId = active.id
    const containerId = active.data?.current?.sortable?.containerId
    if (!activeId || !containerId) return

    // dragging always happens in current(window/colelction)
    // * find active(dragging item) is window or tab
    let activeItem
    if (type === "window") {
      // current is window, dragging item is tab
      console.log("🖱️ on drag start - dragging tab", active)
      const targetTab = current.tabs.find((t) => t.id === activeId)
      if (targetTab) {
        activeItem = targetTab
        setDraggingItem(targetTab)
        setOriginContainerId(targetTab.windowId)
      }
    } else {
      // current is collection, dragging item is window or tab
      for (const window of current.windows) {
        if (activeId === window.id) {
          // dragging item is window
          console.log("🖱️ on drag start - dragging window", active)
          activeItem = window
          setDraggingItem(window)
          setOriginContainerId(window.collectionId)
          break // ?
        } else if (containerId === window.id) {
          // dragging item is tab
          console.log("🖱️ on drag start - dragging tab", active)
          const targetTab = window.tabs.find((t) => t.id === activeId)
          if (targetTab) {
            activeItem = targetTab
            setDraggingItem(targetTab)
            setOriginContainerId(targetTab.windowId)
            break
          }
        }
      }
    }

    // * handle tabs hidden
    // - dragging is window, all tabs in all current windows hidden
    const draggingType = activeItem.tabs ? "window" : "tab"
    if (draggingType === "window") {
      current.windows.map((window) => {
        dispatch(
          updateTabs({
            tabs: window.tabs.map((t) => ({ ...t, hidden: true })),
            windowId: window.id,
            collectionId: window.collectionId ?? current.id
          })
        )
      })
      return
    }

    // - dragging is tab, hide other selected tabs if necessary
    const selectedWindowTabs = tabsByWindowMap.get(activeItem.windowId)
    const selectedWindowTabsCount = selectedWindowTabs?.length ?? 0
    console.log(
      "🖱️ on drag start - dragging tab @selectedWindowTabs",
      selectedWindowTabs
    )

    if (
      selectedWindowTabsCount > 1 &&
      selectedWindowTabs.some((t) => t.id === activeId)
    ) {
      setSelected(
        { hidden: true },
        activeItem.windowId,
        (tab) => tab.id !== activeId
      )
      setDraggingCount(selectedWindowTabsCount)
    } else {
      setDraggingCount(1)
    }
  }

  const handleDragOver = (e) => {
    console.log("🖱️ on drag over", e, "@draggingItem", draggingItem)
    const { active, over } = e
    if (!active || !over) return

    const activeId = active.id
    const overId = over.id

    const activeContainerId = draggingItem.windowId ?? draggingItem.collectionId // since active.data?.current?.sortable?.containerId will change after set to the new window during the drag over event
    const overContainerId = over.data?.current?.sortable?.containerId
    console.log(
      "--- on drag over @activeId",
      activeId,
      "@overId",
      overId,
      "@activeContainerId",
      activeContainerId,
      "@overContainerId",
      overContainerId
    )

    // * active is window
    if (draggingItem.tabs) return

    // * active & over is in the same list
    if (activeContainerId === overContainerId || activeContainerId === overId)
      return

    // * active is tab, over is sidebar item, do nothing
    if (!overContainerId) return

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

  const handleDragEnd = ({ active, over }) => {
    console.log("🖱️ on drag end", active, over)

    const activeId = active.id
    const overId = over.id

    const activeContainerId =
      draggingItem.windowId ??
      draggingItem.collectionId ??
      active.data?.current?.sortable?.containerId // since active.data?.current?.sortable?.containerId will change after set to the new window during the drag over event
    const overContainerId = over.data?.current?.sortable?.containerId

    // * active is window
    if (draggingItem.tabs) {
      console.log(
        "-- @acitveId",
        activeId,
        "@overId",
        overId,
        "@activeContainerId",
        activeContainerId,
        "@overContainerId",
        overContainerId
      )

      if (activeContainerId === overContainerId) {
        // * 1. reorder in the collection
        // active is window, over is window in the same collection
        if (activeId !== overId) {
          const newIndex = over?.data?.current?.sortable?.index
          dispatch(
            updateWindow({
              window: draggingItem,
              collectionId: current.id,
              index: newIndex
            })
          )
          dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
        }
      } else {
        // * 2. move window to other sidebar collection
        // active is window, over is sidebar collection
        // no need to remove window, just add it to the target collection
        if (!overId) return

        if (typeof overId !== "number") {
          console.log("active is window, over is sidebar collection")
          // remove window from current collection
          dispatch(
            removeWindow({
              windowId: draggingItem.id,
              collectionId: current.id
            })
          )
          // add window to target collection
          dispatch(addWindow({ window: draggingItem, collectionId: overId }))
          // update edit map
          dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
          dispatch(
            updateEditedList({ id: overId, type: "collection", isEdited: true })
          )
        }
      }

      // set all windows'tabs visible
      current.windows.map((window) => {
        dispatch(
          updateTabs({
            tabs: window.tabs.map((t) => ({ ...t, hidden: false })),
            windowId: window.id,
            collectionId: window.collectionId ?? current.id
          })
        )
      })
      // in case dragging window moved to other collection not in the current windows
      dispatch(
        updateTabs({
          tabs: draggingItem.tabs.map((t) => ({ ...t, hidden: false })),
          windowId: draggingItem.id,
          collectionId: draggingItem.collectionId ?? overId
        })
      )

      setDraggingItem(null)
      return
    }

    // * active is tab
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

    if (activeContainerId === overContainerId || activeContainerId === overId) {
      // * active is tab, over is tab in the other list (since active's container id is changed in drag over)
      // * & active is tab, over is tab in the same list

      // active is tab in the index of new order
      if (activeId !== overId) {
        console.log("active is tab, over is tab, activeId !== overId")
        const newIndex = over?.data?.current?.sortable?.index
        dispatch(
          updateTabs({
            tabs,
            windowId: activeContainerId,
            collectionId: current.id,
            index: newIndex
          })
        )
        dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
      }
    } else {
      // * active is tab
      if (!overId) return

      if (typeof overId === "number") {
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
        console.log("active is tab, over is sidebar collection")
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

      // dragging is tab, and over is the window/list in the content, always return over tab first
      if (intersections[0]?.data?.droppableContainer?.data?.current?.sortable)
        return [intersections[0]]

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
      // since it will let styled of draggable item outside droppabel container disappear
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
          <OverlayList count={draggingCount}></OverlayList>
        </DragOverlay>
      </Provider>
    </DndContext>
  )
}
