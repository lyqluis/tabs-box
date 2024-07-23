import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragOver = () => {}
  const handleDragEnd = () => {}

  return (
    <DndContext
      sensors={sensors}
      // todo
      // collisionDetection={collisionDetectionStrategy} // DO NOT use default - rectangle intersection, since it will let styled of draggable item outside droppabel container disappear
      collisionDetection={closestCenter} // DO NOT use default - rectangle intersection, since it will let styled of draggable item outside droppabel container disappear
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  )
}
