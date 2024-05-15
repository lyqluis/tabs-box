import "../../style"

import { ListItem } from "."

const List = ({ window }) => {
  return (
    <div className="p-5 text-clip">
      <h1>Window: {window.focused ? "current" : window.id}</h1>
      <ul>
        {window.tabs.map((tab, i) => {
          return <ListItem tab={tab} key={`${tab.url}-${i}`}></ListItem>
        })}
      </ul>
    </div>
  )
}

export default List
