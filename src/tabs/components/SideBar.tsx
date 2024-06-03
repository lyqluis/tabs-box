import { useEffect, useRef } from "react"
import Pinned from "react:~assets/svg/pin.svg"

import { fromNow, shortURL } from "~tabs/utils"
import { useTabEvents } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import { setCurrent } from "./reducer/actions"

const SideBar = ({}) => {
  const init = useRef(false)
  const onSelect = async (windowOrCollection) => {
    console.log("sidebar select item", windowOrCollection)
    // selected is window, get target window's current tabs
    if (!windowOrCollection.created) {
      // const window = await getWindow(windowOrCollection.id)
      // dispatch(setWindow(window))
      // windowOrCollection = window
    }
    dispatch(setCurrent(windowOrCollection))
  }
  const {
    state: { windows, collections, current },
    dispatch
  } = useGlobalCtx()

  useEffect(() => {
    if (!init.current && windows.length) {
      console.log("current", windows)
      dispatch(setCurrent(windows[0]))
      init.current = true
    }
  }, [windows])

  useTabEvents()

  return (
    <aside
      className="flex h-screen w-1/3 min-w-52 flex-col bg-gradient-to-b
       from-danube-700 to-danube-600 px-3.5
       text-base font-medium text-danube-200"
    >
      <h1>side bar</h1>
      <h2>windows</h2>
      <ul className="flex-none">
        {windows.map((window) => (
          <li
            key={window.id}
            className={`mb-2.5 flex h-20 w-full cursor-pointer
             flex-col justify-between
             overflow-hidden rounded-md p-3.5 font-light
             shadow hover:bg-danube-800 hover:text-danube-50
             ${window?.id === current?.id ? "bg-danube-800 font-medium text-danube-50" : ""} 
            `}
            onClick={() => onSelect(window)}
          >
            <p className="flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
              {/* // TODO {current.id === window.id ? "Current" : "Window"} */}
              Window
            </p>
            <p
              className={`overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extralight italic text-danube-200`}
            >
              {/* // TODO 1st tab's url without pinned + tabs.length */}
              <span>
                {shortURL(window.tabs.find((tab) => !tab.pinned).url)}
              </span>
            </p>
            <p className={`text-xs font-extralight text-danube-200`}>
              {window.tabs.length + " tabs"}
            </p>
          </li>
        ))}
      </ul>
      <h2>collections</h2>
      <ul className="flex-grow overflow-y-scroll">
        {collections.map((collection) => (
          <li
            key={collection.created}
            className={`mb-2.5 flex h-20 w-full cursor-pointer
             flex-col justify-between 
             overflow-hidden rounded-md p-3.5 font-light
             shadow hover:bg-danube-800 hover:text-danube-50
             ${collection === current ? "bg-danube-800 font-medium text-danube-50" : ""}
            `}
            onClick={() => onSelect(collection)}
          >
            <p className="flex items-center justify-between overflow-hidden leading-tight">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {collection.title}
              </span>
              <i
                className={`flex h-5 w-5 flex-none items-center justify-start`}
              >
                {collection.pinned ? (
                  <Pinned className={`h-full w-full fill-danube-50`}></Pinned>
                ) : (
                  ""
                )}
              </i>
            </p>
            <p className={`text-xs font-extralight text-danube-200`}>
              Updated {fromNow(collection.updated)}
            </p>
          </li>
        ))}
      </ul>
      <button className="h-20 w-20 rounded-full bg-danube-600 p-5">
        setting
      </button>
    </aside>
  )
}

export default SideBar
