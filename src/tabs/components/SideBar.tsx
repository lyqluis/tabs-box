import { useEffect, useRef } from "react"
import Pinned from "react:~assets/svg/pin.svg"

import { useGlobalCtx } from "./context"
import { setCurrent } from "./reducer/actions"

const SideBar = ({}) => {
  const init = useRef(false)
  const onSelect = (windowOrCollection) => {
    console.log("sidebar select item", windowOrCollection)
    dispatch(setCurrent(windowOrCollection))
  }
  const {
    state: { windows, collections, current },
    dispatch
  } = useGlobalCtx()

  useEffect(() => {
    if (!init.current && windows.length) {
      console.log("current", windows)
      console.log("sidebar data refreshed")
      dispatch(setCurrent(windows[0]))
      init.current = true
    }
  }, [windows])

  return (
    <aside
      className="w-1/3 min-w-52 h-screen px-3.5 flex flex-col
       bg-gradient-to-b from-danube-700 to-danube-600
       text-danube-200 text-base font-medium">
      <h1>side bar</h1>
      <h2>windows</h2>
      <ul className="flex-none">
        {windows.map((window) => (
          <li
            key={window.id}
            className={`mb-2.5 px-3.5 w-full h-20 rounded-md
           hover:bg-danube-800 hover:text-danube-50 
             flex content-center items-center 
             shadow font-light cursor-pointer
             ${window === current ? "bg-danube-800 text-danube-50 font-medium" : ""} 
            `}
            onClick={() => onSelect(window)}>
            window: {window.focused ? "current" : window.id}
          </li>
        ))}
      </ul>
      <h2>collections</h2>
      <ul className="flex-grow overflow-y-scroll">
        {collections.map((collection) => (
          <li
            key={collection.created}
            className={`mb-2.5 p-3.5 w-full h-20 rounded-md
           hover:bg-danube-800 hover:text-danube-50
             shadow font-light cursor-pointer
             ${collection === current ? "bg-danube-800 text-danube-50 font-medium" : ""}
            `}
            onClick={() => onSelect(collection)}>
            <p className="w-full flex justify-between items-center text-ellipsis overflow-hidden">
              {collection.title}
              <i
                className={`flex-none w-5 h-5 flex justify-start items-center`}>
                {collection.pinned ? (
                  <Pinned className={`w-full h-full fill-danube-50`}></Pinned>
                ) : (
                  ""
                )}
              </i>
            </p>
          </li>
        ))}
      </ul>
      <button className="p-5 w-20 h-20 rounded-full bg-danube-600">
        setting
      </button>
    </aside>
  )
}

export default SideBar
