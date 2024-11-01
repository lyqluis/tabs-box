import type { FC } from "react"
import DragableIcon from "react:~assets/svg/dragable.svg"
import WindowIcon from "react:~assets/svg/window.svg"

import { useSelectContext } from "~tabs/contexts/selectContext"

import { ListItem } from "../list"
import { useDndContext } from "./Dnd"

interface OverlayListProps {
  count?: number // number of selected list item
}
export const OverlayList: FC<OverlayListProps> = ({ count }) => {
  const { draggingItem } = useDndContext()
  const { selectedList } = useSelectContext()

  if (!draggingItem) return null

  // dragging list
  if (draggingItem.tabs) {
    return (
      <div
        className="relative text-clip p-5"
        style={{ background: "lightyellow" }}
      >
        {/* list operation */}
        <div className="sticky top-0 mb-4 mt-4 flex h-5 items-center justify-start">
          {/* draggable */}
          <i
            className={`list-item__handle flex h-5 w-5 flex-none items-center justify-start`}
          >
            <DragableIcon
              className={`flex h-full w-full fill-slate-300 hover:cursor-grab focus:cursor-grabbing focus:outline-none`}
            ></DragableIcon>
          </i>
          {<WindowIcon className="h-full w-7 fill-slate-700"></WindowIcon>}
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
