import { useState } from "react"

const data = [
  {
    id: "window-1",
    children: [{ id: "window-1-1" }, { id: "window-1-2" }, { id: "window-1-3" }]
  },
  {
    id: "window-2",
    children: [{ id: "window-2-1" }, { id: "window-2-2" }, { id: "window-2-3" }]
  },
  {
    id: "window-3",
    children: [{ id: "window-3-1" }, { id: "window-3-2" }, { id: "window-3-3" }]
  }
]
export const Tst = ({}) => {
  const [list, setList] = useState(data)
  
  
  return <></>
}
