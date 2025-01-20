import { useState, type FC } from "react"
import DragableIcon from "react:~assets/svg/dragable.svg"
import Pinned from "react:~assets/svg/pin.svg"

import { jumptToTab, openTabs } from "~tabs/utils/platform"

import { useDndContext, useSortableItem } from "../Dnd"
import Icon from "../Icon"
import { highlight, useSearchCtx } from "../searchContext"

interface ListItemProps {
  tab: Tab
  checked: boolean
  type: "window" | "collection"
  overlay?: boolean
  onSelect?: (props) => void
}

const ListItem: FC<ListItemProps> = ({
  tab,
  type,
  onSelect,
  overlay,
  checked
}) => {
  // console.log("list item refreshed", tab.title, checked)
  const {
    attributes,
    listeners,
    setNodeRef,
    style: sortableStyle
  } = useSortableItem({
    id: tab.id
  })
  const { draggingItem } = useDndContext()
  const { query, jumped } = useSearchCtx()
  const [isHovered, setIsHovered] = useState(false)

  const onChange = (e) => {
    onSelect({ tab, isSelected: !checked })
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

  const className =
    "flex flex-nowrap items-center overflow-hidden text-ellipsis whitespace-nowrap align-baseline text-base font-light hover:bg-slate-100" +
    (checked ? " bg-slate-100" : "") +
    (jumped?.id === tab.id
      ? " animate-once animate-duration-[2000ms] animate-ease-in-out animate-pulse bg-slate-100"
      : "")

  return (
    <li
      ref={setNodeRef}
      style={{
        ...sortableStyle,
        opacity: !overlay && draggingItem?.id === tab.id ? 0.5 : 1
      }}
      className={className}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <i
        className={`flex h-5 w-5 flex-none items-center justify-start ${tab.pinned ? "" : "list-item__handle"}`}
      >
        {tab.pinned ? (
          <Icon
            Svg={Pinned}
            className={`h-full w-full fill-slate-700 hover:cursor-grab focus:cursor-grabbing focus:outline-none`}
            {...attributes}
            {...listeners}
          />
        ) : (
          <Icon
            Svg={DragableIcon}
            className={`h-full w-full fill-slate-300 hover:cursor-grab focus:cursor-grabbing focus:outline-none ${isHovered || checked ? "flex" : "hidden"}`}
            {...attributes}
            {...listeners}
          />
        )}
      </i>
      <div className="form-cont">
        <label className="label cursor-pointer">
          <input
            type="checkbox"
            className="checkbox-primary checkbox checkbox-sm"
            checked={checked ?? false}
            onChange={onChange}
          />
        </label>
      </div>
      <span className="m-0.5 flex w-6 flex-none items-center justify-center">
        {type === "window" && tab.status === "loading" ? (
          <span className="loading loading-spinner loading-sm text-gray-500"></span>
        ) : (
          <img src={tab.favIconUrl} alt="" className="w-4" />
        )}
      </span>
      <span
        className={`mr-2 flex-none ${tab.status === "loading" ? "text-gray-500" : ""}`}
      >
        {highlight(tab.title, query)}
      </span>
      {isHovered && (
        <a
          className="link-hover link items-center overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-400"
          title={tab.url}
          onClick={() => handleClickUrl(tab)}
        >
          {highlight(tab.url, query)}
        </a>
      )}
    </li>
  )
}

export default ListItem
