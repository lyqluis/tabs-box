import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useCallback, useEffect, useRef, useState } from "react"

import useSeletedList from "~tabs/hooks/useSelect"

// Dnd Context
const List = ({ list, setList, window, children = null }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const { selectedList, setSelectedList } = useSeletedList()
  const onSelect = (item) => {
    console.log("on select", item)
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter((val) => val.id !== item.id))
    } else {
      setSelectedList([...selectedList, item])
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        let res
        // multi drag
        if (selectedList.some((item) => item.id === active.id)) {
          let startIndex = newIndex
          res = items.slice()
          selectedList.map((item) => {
            const oldIndex = res.findIndex((val) => val.id === item.id)
            if (oldIndex >= 0) {
              res = arrayMove(res, oldIndex, startIndex++)
            }
          })
        } else {
          res = arrayMove(items, oldIndex, newIndex)
        }
        console.log("drag end", active, over, oldIndex, newIndex, res)

        return res
      })
    }
  }

  const handleDragOver = (event) => {
    console.log("list on drag over", event)
  }
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "5px",
        background: "#cdcdcd"
      }}
    >
      <SortableContext items={list} strategy={verticalListSortingStrategy}>
        <Droppable window={window}>
          {/* {children} */}
          {list.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              item={item}
              onSelect={() => onSelect(item)}
              isSelected={selectedList.includes(item)}
            />
          ))}
        </Droppable>
      </SortableContext>
    </div>
  )
}

// SortableItem
const SortableItem = ({ id, item, onSelect, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id, // must not be 0
      disabled: id < 5
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isSelected ? "#aaa" : ""
  }

  // console.log("Sortable Item - style", style)

  return (
    <div ref={setNodeRef} style={style}>
      <input
        type="checkbox"
        value={isSelected}
        onClick={() => {
          console.log("on item click")
          onSelect(item)
        }}
      />
      <span style={{ margin: "5px" }}>{item.value ?? item.id}</span>
      <span
        {...attributes}
        {...listeners}
        style={{
          display: "inline-block",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#555"
        }}
      ></span>
    </div>
  )
}

// Dropable
const Droppable = ({ window = null, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: window?.id ?? "area"
  })

  return (
    <div ref={setNodeRef} style={{ background: isOver ? "orange" : "" }}>
      <h3>{window?.id}</h3>
      {children}
    </div>
  )
}

export const Tst = () => {
  const [collections, setCollections] = useState([
    {
      id: "tst-collection-1",
      windows: [
        // window1
        {
          id: "tst-c1-w1",
          tabs: [
            {
              id: "tst-c1-w1-t1"
            },
            {
              id: "tst-c1-w1-t2"
            },
            {
              id: "tst-c1-w1-t3"
            }
          ]
        },
        {
          id: "tst-c1-w2",
          tabs: [
            {
              id: "tst-c1-w2-t1"
            },
            {
              id: "tst-c1-w2-t2"
            },
            {
              id: "tst-c1-w2-t3"
            }
          ]
        }
      ]
    },
    {
      id: "tst-collection-2",
      windows: [
        // window1
        {
          id: "tst-c2-w1",
          tabs: [
            {
              id: "tst-c2-w1-t1"
            },
            {
              id: "tst-c2-w1-t2"
            },
            {
              id: "tst-c2-w1-t3"
            }
          ]
        },
        {
          id: "tst-c2-w2",
          tabs: [
            {
              id: "tst-c2-w2-t1"
            },
            {
              id: "tst-c2-w2-t2"
            },
            {
              id: "tst-c2-w2-t3"
            }
          ]
        }
      ]
    }
  ])
  const [current, setCurrent] = useState(collections[0])
  const [tabs1, setTabs1] = useState(collections[0].windows[0].tabs)
  const [tabs2, setTabs2] = useState(collections[0].windows[1].tabs)
  const window1 = collections[0].windows[0]
  const window2 = collections[0].windows[1]

  useEffect(() => {
    setTabs1(collections[0].windows[0].tabs)
    setTabs2(collections[0].windows[1].tabs)
  }, [collections])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const findWindow = (tabId) => {
    for (const collection of collections) {
      const window = collection.windows.find(
        (w) => w.id === tabId || w.tabs.some((t) => t.id === tabId)
      )
      if (window) return window
    }
  }
  const findCollection = (id) => {
    return collections.find((c) => c.id === id)
  }

  const handleDragOver = (event) => {
    const { active, over } = event // over.id maybe window.id or tab.id

    if (!over?.id) return
    // ## switch over.id -> tab.id / window.id / collection.id

    // ## collection.id, drag tab to side bar item
    if (over.id.includes("tst-collection-")) {
      // todo
      // remove tab from active collection.window.tabs
      const activeContainer = findWindow(active.id) // window
      activeContainer.tabs = activeContainer.tabs.filter(
        (t) => t.id !== active.id
      )

      // add tab to target/over collection.window.tabs
      // maybe create a new window to add to
    }
    // ## window.id / tab.id, set tab between windows
    // find active list & over list
    const activeContainer = findWindow(active.id) // window
    const overContainer = findWindow(over.id) // window

    console.log("on drag over", event, activeContainer, overContainer)
    if (!overContainer) return

    // move to other window
    if (activeContainer !== overContainer) {
      setCollections((collections) => {
        // delete tab from active container
        const activeTab = activeContainer.tabs.find((t) => t.id === active.id)
        activeContainer.tabs = activeContainer.tabs.filter(
          (t) => t.id !== active.id
        )

        // add tab to over container
        // *
        // let newIndex
        // if (collections.some((c) => c.windows.some((w) => w.id === over.id))) {
        //   // if over.id is window.id, add tab to the last
        //   newIndex = overContainer.tabs.length + 1
        // } else {
        //   // over.id is tab.id
        //   // todo
        //   const overIndex = overContainer.tabs.findIndex(
        //     (t) => t.id === over.id
        //   )
        //   const isBelowOverItem =
        //     over &&
        //     active.rect.current.translated &&
        //     active.rect.current.translated.top >
        //       over.rect.top + over.rect.height

        //   const modifier = isBelowOverItem ? 1 : 0

        //   newIndex =
        //     overIndex >= 0
        //       ? overIndex + modifier
        //       : overContainer.tabs.length + 1
        // }
        // // TODO ??? why it works ??
        // overContainer.tabs = [
        //   ...overContainer.tabs.slice(0, newIndex),
        //   activeTab,
        //   ...overContainer.tabs.slice(newIndex, overContainer.tabs.length)
        // ]

        // * tst
        overContainer.tabs = [...overContainer.tabs, activeTab]

        console.log("------on drag over", overContainer.tabs)

        const newWindows = collections[0].windows.slice()
        collections[0].windows = newWindows

        return [...collections]
      })
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    console.log("on drag end", event)
    const activeWindow = findWindow(active.id)
    const overWindow = findWindow(over.id)
    if (activeWindow === overWindow) {
      // find active index, find over index
      const window = activeWindow
      const tabs = window.tabs.slice()
      const activeOriginIndex = tabs.findIndex((t) => t.id === active.id)
      const activeTab = tabs[activeOriginIndex]
      const targetIndex = tabs.findIndex((t) => t.id === over.id)
      if (
        activeOriginIndex > -1 &&
        targetIndex > -1 &&
        activeOriginIndex !== targetIndex
      ) {
        // change index position
        // tabs.splice(activeOriginIndex, 1)
        // tabs.splice(targetIndex, 0, activeTab)
        // window.tabs = tabs
        window.tabs = arrayMove(tabs, activeOriginIndex, targetIndex)

        setCollections((collections) => {
          return [...collections]
        })
      }
    }
  }

  // TODO customize collision detection ?
  const collisionDetectionStrategy = useCallback(
    (args) => {},
    [
      collections
      // activeId
    ]
  )

  return (
    <div
      className="app"
      style={{
        display: "flex",
        width: "100%"
      }}
    >
      <DndContext
        sensors={sensors}
        // todo
        // collisionDetection={collisionDetectionStrategy} // DO NOT use default - rectangle intersection, since it will let styled of draggable item outside droppabel container disappear
        collisionDetection={closestCenter} // DO NOT use default - rectangle intersection, since it will let styled of draggable item outside droppabel container disappear
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="sidebar"
          style={{
            background: "lightblue",
            width: "200px",
            padding: "5px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {collections.map((collection) => (
            <Droppable window={collection}>
              <div
                className="sidebar-item"
                style={{
                  margin: "10px",
                  background: current === collection ? "lightyellow" : "blue",
                  padding: "10px"
                }}
                onClick={() => setCurrent(collection)}
              >
                <p>{collection.id}</p>
                {collection.windows.map((window) => (
                  <li>
                    {window.id}
                    <ul>
                      {window.tabs.map((tab) => (
                        <li>{tab.id}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </div>
            </Droppable>
          ))}
        </div>
        <div
          className="content"
          style={{
            width: "100%",
            height: "100%"
            // padding:
            //   "50px" /* padding will cause offset in collision detection */
          }}
        >
          {/* <Droppable> */}
          {/* window1 */}
          <List list={tabs1} setList={setTabs1} window={window1}></List>
          {/* // * list's margin should be as thinner as possible since item dragged disappear in the gap between droppable */}
          {/* window2 */}
          <List list={tabs2} setList={setTabs2} window={window2}></List>
          {/* </Droppable> */}
        </div>
      </DndContext>
    </div>
  )
}
