import "../../style"

import { useEffect, useState } from "react"
import { ReactSortable } from "react-sortablejs"

import { ListItem } from "."

const List = ({ window }) => {
  const [tabs, setTabs] = useState(window?.tabs ?? window?.links ?? [])

  useEffect(() => {
    setTabs(window.tabs ?? window.links)
  }, [window])

  useEffect(() => {
    console.log("tabs update", tabs)
  }, [tabs])

  if (!tabs || !tabs.length) return

  return (
    <div className="p-5 text-clip">
      <h1>Window: {window.focused ? "current" : window.id}</h1>
      <ReactSortable
        tag="ul"
        list={tabs}
        setList={setTabs}
        handle=".list-item__handle">
        {tabs.map((tab, i) => {
          return <ListItem tab={tab} key={`${tab.url}-${i}`}></ListItem>
        })}
      </ReactSortable>
    </div>
  )
}

export default List
