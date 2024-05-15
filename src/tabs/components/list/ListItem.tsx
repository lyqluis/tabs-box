import { useState } from "react"

import "../../style"

const ListItem = ({ tab }) => {
  const [isHovered, setIsHovered] = useState(false)
  const onMouseOver = (e) => setIsHovered(true)
  const onMouseLeave = (e) => setIsHovered(false)
  return (
    <li
      style={{ display: "flex" }}
      className="flex flex-nowrap
       text-base font-light
     hover:bg-slate-100 align-baseline 
       overflow-hidden"
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}>
      <span
        className="flex-none m-0.5 w-7 
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
