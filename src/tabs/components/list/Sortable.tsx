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
import { useRef, useState } from "react"

import useSeletedList from "~tabs/hooks/useSelect"

// Dnd Context
export const Sortable = ({ list, setList, children }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const { selectedList, setSelectedList } = useSeletedList("tst")
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={list} strategy={verticalListSortingStrategy}>
        {children}
        {/* {list.map((item) => (
          <SortableItem
          key={item.id}
            id={item.id}
            item={item}
            // onSelect={() => onSelect(item)}
            // isSelected={selectedList.includes(item)}
            />
            ))} */}
      </SortableContext>
    </DndContext>
  )
}

// SortableItem
export const SortableItem = ({ id, item, onSelect, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id, // must not be 0
      disabled: id < 5
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isSelected ? "#cdcdcd" : ""
  }

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
      <span style={{ margin: "5px" }}>{item.value}</span>
      <button {...attributes} {...listeners}>
        drag icon
      </button>
    </div>
  )
}
