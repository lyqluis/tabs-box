import { useDraggable, type Over } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useState, type FC, type ReactNode } from "react"
import DragableIcon from "react:~assets/svg/dragable.svg"
import Pinned from "react:~assets/svg/pin.svg"

import { useSelectContext } from "~tabs/hooks/useSelect"
import { jumptToTab, openTabs } from "~tabs/utils/platform"

import { useDndContext } from "../Dnd"
import { useSortableItem } from "./Sortable"

interface ListItemProps {
  tab: Tab
  // checked: boolean
  type: "window" | "collection"
  overlay?: boolean
  onSelect?: (props) => void
}

const ListItem: FC<ListItemProps> = ({ tab, type, overlay, onSelect }) => {
  // console.log("list item refreshed", tab.title, checked)
  const { attributes, listeners, setNodeRef, style } = useSortableItem({
    id: tab.id
  })
  const { draggingItem } = useDndContext()
  const [isHovered, setIsHovered] = useState(false)

  const onChange = (e) => {
    const newSelected = !tab.checked
    onSelect({ tab, isSelected: newSelected })
  }
  const onMouseOver = (e) => setIsHovered(true)
  const onMouseLeave = (e) => setIsHovered(false)

  const handleClickUrl = (tab) => {
    console.log("on click url", type)

    if (type === "window") {
      // if current is window, jumpt to the target tab
      jumptToTab(tab)
    } else {
      // current is collection, open new tab
      openTabs(tab)
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{
        ...style,
        opacity: !overlay && draggingItem?.id === tab.id ? 0.5 : 1
      }}
      className={`flex flex-nowrap items-center overflow-hidden text-ellipsis whitespace-nowrap align-baseline text-base font-light hover:bg-slate-100
       ${tab.checked ? "bg-slate-100" : ""}
      `}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <i
        className={`flex h-5 w-5 flex-none items-center justify-start ${tab.pinned ? "" : "list-item__handle"}`}
      >
        {tab.pinned ? (
          <Pinned
            className={`h-full w-full fill-slate-700 hover:cursor-grab focus:cursor-grabbing focus:outline-none`}
            {...attributes}
            {...listeners}
          ></Pinned>
        ) : (
          <DragableIcon
            className={`h-full w-full fill-slate-300 hover:cursor-grab focus:cursor-grabbing focus:outline-none ${isHovered || tab.checked ? "flex" : "hidden"}`}
            {...attributes}
            {...listeners}
          ></DragableIcon>
        )}
      </i>
      <div className="form-cont">
        <label className="label cursor-pointer">
          <input
            type="checkbox"
            className="checkbox-primary checkbox checkbox-sm"
            checked={tab.checked ?? false}
            onChange={onChange}
          />
        </label>
      </div>
      <span
        className="m-0.5 flex w-6 
      flex-none items-center justify-center"
      >
        {type === "window" && tab.status === "loading" ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <img src={tab.favIconUrl} alt="" className="w-4" />
        )}
      </span>
      <span className="mr-2 flex-none">
        {tab?.hidden}
        {tab.title}
      </span>
      {isHovered && (
        <a
          className={`cursor-pointer items-center overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-400`}
          onClick={() => handleClickUrl(tab)}
        >
          {tab.url}
        </a>
      )}
    </li>
  )
}

export default ListItem

interface OverlayListItemProps {
  count?: number // number of selected list item
}
export const OverlayListItem: FC<OverlayListItemProps> = ({ count }) => {
  const { draggingItem } = useDndContext()
  const { selectedList } = useSelectContext()

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
