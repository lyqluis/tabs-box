import { shortURL } from "@/utils"
import { useGlobalCtx } from "./context"
import { setCurrent } from "./reducer"

const SideBarItem = ({ item, isSelected, onSelect }) => {
  return (
    <div
      className={
        "group hover:bg-primary hover:text-primary-content flex h-20 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-md p-3.5 shadow-md" +
        (isSelected
          ? " bg-primary text-primary-content font-semibold"
          : " bg-base-100 text-base-content font-normal")
      }
      onClick={() => onSelect(item)}
      data-id={item.id}
    >
      <p className="flex items-center justify-between overflow-hidden leading-tight text-ellipsis whitespace-nowrap">
        {/* // TODO: {current.id === window.id ? "Current" : "Window"} */}
        Window
      </p>
      <p className="overflow-hidden text-xs font-extralight text-ellipsis whitespace-nowrap italic">
        <span>{shortURL(item?.tabs?.find((tab) => !tab.pinned)?.url)}</span>
      </p>
      <p className="text-xs font-light">{item?.tabs?.length + " tabs"}</p>
      <div className="absolute top-0 right-2 bottom-0 flex items-center"></div>
    </div>
  )
}

export const SideBar = ({}) => {
  const { state, dispatch } = useGlobalCtx() // 确保正确解构 state

  if (!state) {
    return <div>Loading...</div> // 或者其他适当的加载状态
  }

  const { windows, collections } = state

  const onSelect = (item) => {
    console.log("onSelected")
    dispatch(setCurrent(item))
  }

  return (
    <aside className="from-base-200 to-base-300 text-base-content flex h-screen w-1/3 min-w-52 flex-col bg-gradient-to-b from-80% pl-3.5 text-base font-medium">
      <ul
        className={
          "scrollbar scroll-container flex-grow overflow-y-scroll pr-3.5"
        }
      >
        {windows.map((item) => (
          <SideBarItem
            key={item.id}
            item={item}
            isSelected={item.id === state?.current?.id} // TODO:
            onSelect={() => onSelect(item)}
          ></SideBarItem>
        ))}
      </ul>
    </aside>
  )
}
