import { useState } from "react"
import DragableIcon from "react:~assets/svg/dragable.svg"
import Pinned from "react:~assets/svg/pin.svg"

import "../../style"

interface ListItemProps {
  tab: chrome.tabs.Tab
  onSelect?: () => void
}

const ListItem = ({ tab, onSelect, checked }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(checked)

  const onChange = (e) => {
    const newSelected = !isSelected
    setIsSelected(newSelected)
    onSelect({ tab, isSelected: newSelected })
  }
  const onMouseOver = (e) => setIsHovered(true)
  const onMouseLeave = (e) => setIsHovered(false)

  return (
    <li
      style={{ display: "flex" }}
      className={`flex flex-nowrap items-center
       text-base font-light
     hover:bg-slate-100 align-baseline 
       ${isSelected ? "bg-slate-100" : ""}
       overflow-hidden
      `}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}>
      {/* // TODO toggle, pinned <-> dragable */}
      <i
        className={`flex-none w-5 h-5 flex justify-start items-center ${tab.pinned ? "" : "list-item__handle"}`}>
        {tab.pinned ? (
          <Pinned className={`w-full h-full fill-slate-700`}></Pinned>
        ) : (
          <DragableIcon
            className={`w-full h-full fill-slate-300 ${isHovered || isSelected ? "flex" : "hidden"}`}></DragableIcon>
        )}
      </i>
      <div className="form-cont">
        <label className="label cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={isSelected}
            onChange={onChange}
          />
        </label>
      </div>
      <span
        className="flex-none m-0.5 w-6 
        flex justify-center items-center">
        <img src={tab.favIconUrl} alt="" className="w-4" />
      </span>
      <span className="flex-none mr-2">{tab.title}</span>
      <a
        className={`w-auto text-slate-400 flex-none 
         ${isHovered ? "flex" : "hidden"}
         items-center text-sm
        `}>
        {tab.url}
      </a>
    </li>
  )
}

export default ListItem
