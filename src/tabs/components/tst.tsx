import { useEffect, useState } from "react"

import { ListItem } from "./list"

const List = ({ window }) => {
  const [tabs, setTabs] = useState(window?.tabs ?? window?.links ?? [])

  if (!tabs || !tabs.length) return

  return (
    <div className="p-5 text-clip">
      <h1>Window: {window.focused ? "current" : window.id}</h1>
      {tabs.map((tab, i) => {
        return <ListItem tab={tab} key={`${tab.url}-${i}`}></ListItem>
      })}
    </div>
  )
}

export default List
