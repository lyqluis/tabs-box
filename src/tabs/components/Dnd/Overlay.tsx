import type { FC } from "react"

import { ListItem } from "../list"
import { useDndContext } from "./Dnd"

interface OverlayListItemProps {
  count?: number // number of selected list item
}
export const OverlayListItem: FC<OverlayListItemProps> = ({ count }) => {
  const { draggingItem } = useDndContext()

  if (draggingItem) {
    if (count > 1) {
      return (
        <div className="indicator" style={{ width: "auto", display: "block" }}>
          <span className="badge indicator-item badge-secondary">{count}</span>
          <ListItem
            tab={draggingItem}
            // checked={selectedList.some((t) => t.id === draggingItem.id)}
            overlay
          ></ListItem>
        </div>
      )
    } else {
      return (
        <ListItem
          tab={draggingItem}
          // checked={selectedList.some((t) => t.id === draggingItem.id)}
          overlay
        ></ListItem>
      )
    }
  }
}
