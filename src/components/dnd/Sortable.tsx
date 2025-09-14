import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
export const Sortable = ({ list, children, listId }) => {
  return (
    <SortableContext
      items={list}
      strategy={verticalListSortingStrategy}
      id={listId}
    >
      {children}
    </SortableContext>
  )
}
