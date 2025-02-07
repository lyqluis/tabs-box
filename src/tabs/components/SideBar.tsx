import { useEffect } from "react"
import Pinned from "react:~assets/svg/pin.svg"
import TopSvg from "react:~assets/svg/top.svg"

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
    type,
    current,
    dispatch
  } = useGlobalCtx()

  const {
    scrollRef: windowListRef,
    isOverflowTop: isOverflowTopWindowList,
    isOverflowBottom: isOverflowBottomWindowList
  } = useScroll()
  const { scrollRef, isOverflowTop, isOverflowBottom, scrollToTop, scrollTo } =
    useScroll()
  useTabEvents()
  useWindowEvents()

  useEffect(() => {
    if (current) {
      if (type === "collection") {
        // todo: use element.scrollTo api to scroll to target
        // 1. check if the target item in the view
        // 1.1 get target item element
        // 2. if not, scroll to the target
        // element.scrollTo({
        //   top: targetScrollTop,
        //   behavior: 'smooth'
        // })

        // 1. get the target item index
        const index = collections.findIndex((item) => item === current)
        // 2. caculate the target item element's top
        if (index > -1) {
          const rootFontSize = parseFloat(
            getComputedStyle(document.documentElement).fontSize
          )
          const itemHeight = (5 + 0.625) * rootFontSize // rem => px
          const offset = 10 // px
          const targetTop = index * itemHeight - offset
          scrollTo(targetTop)
        }
      }
    }
  }, [current])

  if (!current) return <>loading</>

  return (
    <aside className="flex h-screen w-1/3 min-w-52 flex-col bg-gradient-to-b from-base-200 from-80% to-base-300 pl-3.5 pr-[0.375rem] text-base font-medium text-base-content">
      <div className="my-2 mr-5 flex justify-between">
        <p>windows</p>
      </div>
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
      <div className="mb-2 mr-5 flex justify-between">
        <p>collections</p>
        {isOverflowTop ? (
          <button className="btn btn-circle btn-xs" onClick={scrollToTop}>
            <Icon Svg={TopSvg} />
          </button>
        ) : null}
      </div>
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
