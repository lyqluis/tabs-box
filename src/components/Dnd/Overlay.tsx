import DragableIcon from "@/assets/svg/dragable.svg?react"
import WindowIcon from "@/assets/svg/window.svg?react"
import type { FC } from "react"

import { useOperationsContext } from "../contexts/operationsContext"
import Icon from "../Icon"
import { ListItem } from "../list"
import { useDndContext, useDndSelector } from "./Dnd"

interface OverlayListProps {
  count?: number // number of selected list item
}
export const OverlayList: FC<OverlayListProps> = ({ count }) => {
  const draggingItem = useDndSelector((v) => v.draggingItem)
  const { selectedList } = useOperationsContext()

  if (!draggingItem) return null

  // dragging list
  if (draggingItem.tabs) {
    return (
      <div className="relative bg-slate-100 py-3 pl-5 text-clip">
        {/* list operation */}
        <div className="sticky top-0 mt-4 mb-4 flex h-5 items-center justify-start">
          {/* draggable */}
          <Icon
            Svg={DragableIcon}
            className="list-item__handle flex h-5 w-5 flex-none items-center justify-start fill-slate-300 outline-none hover:cursor-grab active:cursor-grabbing"
          />
          {<Icon Svg={WindowIcon} className="h-full w-7 fill-slate-700" />}
          <span className="ml-2 text-base font-bold">Window</span>
          {/* // todo: remove window.id */}
          {`: ${draggingItem.id}`}
        </div>
      </div>
    )
  }

  // dragging tab(list item)
  if (count > 1) {
    return (
      <div className="indicator" style={{ width: "auto", display: "block" }}>
        <span className="badge indicator-item badge-secondary">{count}</span>
        <ListItem
          tab={draggingItem}
          checked={selectedList.some((t) => t.id === draggingItem.id)}
          overlay
        ></ListItem>
      </div>
    )
  } else {
    return (
      <ListItem
        tab={draggingItem}
        checked={selectedList.some((t) => t.id === draggingItem.id)}
        overlay
      ></ListItem>
    )
  }
}
