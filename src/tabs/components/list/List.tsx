import "../../style"

import { useEffect, useState } from "react"
import { ReactSortable } from "react-sortablejs"

import { ListItem } from "."

const List = ({ window }) => {
  const [tabs, setTabs] = useState(window.tabs ?? [])

  useEffect(() => {
    setTabs(window.tabs)
  }, [window])

  return (
    <div className="p-5 text-clip">
      <h1>Window: {window.focused ? "current" : window.id}</h1>
      <ReactSortable tag="ul" list={tabs} setList={setTabs} handle='.list-item__handle'>
        {tabs.map((tab, i) => {
          return <ListItem tab={tab} key={`${tab.url}-${i}`}></ListItem>
        })}
      </ReactSortable>
    </div>
  )
}

export default List
