import { useEffect, useState } from "react"
import DragableIcon from "react:~assets/svg/dragable.svg"
import Pinned from "react:~assets/svg/pin.svg"

import { jumptToTab, openTabs } from "~tabs/utils/platform"

import { useSortableItem } from "./Sortable"

interface ListItemProps {
  tab: chrome.tabs.Tab
  onSelect?: () => void
}

const ListItem = ({ tab, onSelect, checked, type }) => {
  // console.log("list item refreshed", tab.title, checked)
  const { attributes, listeners, setNodeRef, style } = useSortableItem({
    id: tab.id
  })
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(checked)

  const onChange = (e) => {
    const newSelected = !isSelected
    setIsSelected(newSelected)
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

  useEffect(() => {
    setIsSelected(checked)
  }, [checked])

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex flex-nowrap items-center overflow-hidden text-ellipsis whitespace-nowrap align-baseline text-base font-light hover:bg-slate-100
       ${isSelected ? "bg-slate-100" : ""}
      `}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <i
        className={`flex h-5 w-5 flex-none items-center justify-start ${tab.pinned ? "" : "list-item__handle"}`}
      >
        {tab.pinned ? (
          <Pinned className={`h-full w-full fill-slate-700`}></Pinned>
        ) : (
          <DragableIcon
            className={`h-full w-full fill-slate-300 hover:cursor-grab focus:cursor-grabbing focus:outline-none ${isHovered || isSelected ? "flex" : "hidden"}`}
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
            checked={isSelected}
            onChange={onChange}
          />
        </label>
      </div>
      <span
        className="m-0.5 flex w-6 
      flex-none items-center justify-center"
      >
        {type === 'window' && tab.status === "loading" ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <img src={tab.favIconUrl} alt="" className="w-4" />
        )}
      </span>
      <span className="mr-2 flex-none">{tab.title}</span>
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
