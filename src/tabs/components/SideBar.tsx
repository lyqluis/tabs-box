import Pinned from "react:~assets/svg/pin.svg"

import { fromNow, shortURL } from "~tabs/utils"
import { useTabEvents, useWindowEvents } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import { Droppable } from "./Dnd"
import { setCurrentId } from "./reducers/actions"
import { highlight, useSearchCtx } from "./searchContext"
import AuthDrive from "./AuthDrive"

const SideBarItem = ({ item, isEdited, isSelected, onSelect }) => {
  const type = item.created ? "collection" : "window"
  const { query } = useSearchCtx()

  let itemContent
  if (type === "window") {
    itemContent = (
      <>
        <p className="flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
          {/* // TODO {current.id === window.id ? "Current" : "Window"} */}
          Window
        </p>
        <p
          className={`overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extralight italic text-danube-200`}
        >
          <span>{shortURL(item?.tabs?.find((tab) => !tab.pinned)?.url)}</span>
        </p>
        <p className={`text-xs font-extralight text-danube-200`}>
          {item?.tabs?.length + " tabs"}
        </p>
      </>
    )
  } else {
    itemContent = (
      <>
        <p className="flex items-center justify-between overflow-hidden leading-tight">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {highlight(item.title, query)}
          </span>
          <i className={`flex h-5 w-5 flex-none items-center justify-start`}>
            {item.pinned ? (
              <Pinned className={`h-full w-full fill-danube-50`}></Pinned>
            ) : (
              ""
            )}
          </i>
        </p>
        <p className={`text-xs font-extralight text-danube-200`}>
          Updated {fromNow(item.updated)}
        </p>
      </>
    )
  }

  return (
    <Droppable item={item}>
      <div className="indicator w-full">
        {isEdited && (
          <span className="badge indicator-item badge-warning badge-xs"></span>
        )}
        <li
          className={`mb-2.5 flex h-20 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-md p-3.5 
          font-light shadow hover:bg-danube-800 hover:text-danube-50 ${isSelected ? "bg-danube-800 font-medium text-danube-50" : ""}`}
          onClick={() => onSelect(item)}
        >
          {itemContent}
        </li>
      </div>
    </Droppable>
  )
}

const SideBar = ({}) => {
  const onSelect = async (windowOrCollection) => {
    console.log("sidebar select item", windowOrCollection)
    dispatch(setCurrentId(windowOrCollection.id))
  }
  const {
    state: { windows, collections, editedMap },
    current,
    dispatch
  } = useGlobalCtx()

  useTabEvents()
  useWindowEvents()

  if (!current) return <>loading</>

  return (
    <aside
      className="flex h-screen w-1/3 min-w-52 flex-col bg-gradient-to-b
       from-danube-700 to-danube-600 px-3.5
       text-base font-medium text-danube-200"
    >
      <h1>side bar</h1>
      <h2>windows</h2>
      <ul className="max-h-60 flex-none overflow-y-scroll p-2">
        {windows.map((window) => (
          <SideBarItem
            key={window.id}
            item={window}
            isEdited={editedMap[window.id]}
            isSelected={window.id === current.id}
            onSelect={onSelect}
          ></SideBarItem>
        ))}
      </ul>
      <h2>collections</h2>
      <ul className="flex-grow overflow-y-scroll p-2">
        {collections.map((collection) => (
          <SideBarItem
            key={collection.id}
            item={collection}
            isEdited={editedMap[collection.id]}
            isSelected={collection.id === current.id}
            onSelect={onSelect}
          ></SideBarItem>
        ))}
      </ul>
      {/* TODO: test auth drive */}
      <AuthDrive />
    </aside>
  )
}

export default SideBar
