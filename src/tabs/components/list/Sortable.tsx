import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
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
import { useEffect, useState } from "react"

import { useGlobalCtx } from "../context"

// sortable item
export const useSortableItem = (sortableOptions) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: sortableOptions.id // must not be 0
      // disabled: id < 5
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return { attributes, listeners, setNodeRef, style }
}

// dnd sortable context
export const Sortable = ({ list, setList, children, onSortEnd, multiList, listId }) => {
  // const {
  //   state: { windows, collections },
  //   current,
  //   type,
  //   dispatch
  // } = useGlobalCtx()

  // const [window, setWindow] = useState(
  //   type === "window" ? current : current.windows[0]
  // )

  // const [pinnedTabs, setPinnedTabs] = useState(
  //   window?.tabs?.filter((tab) => tab.pinned) ?? []
  // )
  // const [tabs, setTabs] = useState(
  //   window?.tabs?.filter((tab) => !tab.pinned) ?? []
  // )

  // useEffect(() => {
  //   setWindow(type === "window" ? current : current.windows[0])
  // }, [current])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        let res
        // multi drag
        if (
          multiList.length > 1 &&
          multiList.some((item) => item.id === active.id)
        ) {
          let startIndex = newIndex
          res = items.slice()
          multiList.map((item) => {
            const oldIndex = res.findIndex((val) => val.id === item.id)
            if (oldIndex >= 0) {
              res = arrayMove(res, oldIndex, startIndex)
              oldIndex > startIndex && startIndex++
            }
          })
        } else {
          res = arrayMove(items, oldIndex, newIndex)
        }
        console.log("drag end", active, over, oldIndex, newIndex, res)
        // trigger sortend callback
        onSortEnd && onSortEnd(res)

        return res
      })
    }
  }

  return (
    // <DndContext
    //   sensors={sensors}
    //   collisionDetection={closestCenter}
    //   onDragEnd={handleDragEnd}
    // >
    // todo sortable item only can work in sortable context area
    // ideal situation is that sortable works in sortable context and outer dropable context
    <SortableContext items={list} strategy={verticalListSortingStrategy} id={listId}>
      {children}
    </SortableContext>
    // </DndContext>
  )
}
