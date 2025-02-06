import Pinned from "react:~assets/svg/pin.svg"

import useScroll from "~tabs/hooks/useScroll"
import { fromNow, shortURL } from "~tabs/utils"
import { useTabEvents, useWindowEvents } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import { Droppable } from "./Dnd"
import Icon from "./Icon"
import { setCurrentId } from "./reducers/actions"
import { highlight, useSearchCtx } from "./searchContext"

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
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extralight italic">
          <span>{shortURL(item?.tabs?.find((tab) => !tab.pinned)?.url)}</span>
        </p>
        <p className="text-xs font-light">{item?.tabs?.length + " tabs"}</p>
      </>
    )
  } else {
    itemContent = (
      <>
        <p className="flex items-center justify-between overflow-hidden leading-tight">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {highlight(item.title, query)}
          </span>
          {item.pinned ? (
            <Icon
              Svg={Pinned}
              className={
                "flex h-5 w-5 flex-none items-center justify-start " +
                (isSelected ? "fill-primary-content" : "fill-base-content")
              }
            />
          ) : null}
        </p>
        <p className="text-xs font-light">Updated {fromNow(item.updated)}</p>
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
          className={
            "mb-2.5 flex h-20 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-md p-3.5 shadow-md hover:bg-primary hover:text-primary-content" +
            (isSelected
              ? " bg-primary font-semibold text-primary-content"
              : " bg-base-100 font-normal text-base-content")
          }
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

  const {
    scrollRef: windowListRef,
    isOverflowTop: isOverflowTopWindowList,
    isOverflowBottom: isOverflowBottomWindowList
  } = useScroll()
  const { scrollRef, isOverflowTop, isOverflowBottom } = useScroll()
  useTabEvents()
  useWindowEvents()

  if (!current) return <>loading</>

  // TODO: scroll arrow icon, scroll shadow
  return (
    <aside className="flex h-screen w-1/3 min-w-52 flex-col bg-gradient-to-b from-base-200 from-80% to-base-300 pl-3.5 pr-[0.375rem] text-base font-medium text-base-content">
      icon
      <h2>windows</h2>
      <ul
        ref={windowListRef}
        className={
          "scrollbar scroll-container max-h-60 flex-none overflow-y-scroll" +
          (isOverflowTopWindowList ? " top-shadow" : "") +
          (isOverflowBottomWindowList ? " bottom-shadow" : "")
        }
      >
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
      <ul
        ref={scrollRef}
        className={
          "scrollbar scroll-container flex-grow overflow-y-scroll" +
          (isOverflowTop ? " top-shadow" : "") +
          (isOverflowBottom ? " bottom-shadow" : "")
        }
      >
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
    </aside>
  )
}

export default SideBar
