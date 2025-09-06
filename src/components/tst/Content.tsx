import { useEffect, useMemo } from "react"
import { useGlobalCtx } from "../contexts/context"

const ContentLayout = ({ current, selectedList, type, children }) => {
  return (
    <div
      className="flex flex-auto flex-col overflow-hidden"
      // onClick={cancelAllSelected}
    >
      <div className="flex flex-none justify-between px-5 pt-8 pb-0">
        {/* title */}
        <div className="flex min-w-1 flex-1 items-center">
          <div className="avatar avatar-placeholder flex-none shrink-0 grow-0">
            <div className="bg-neutral text-neutral-content w-12 rounded-full">
              <span className="text-xl">
                {/* // TODO: type is window, use window icon, type is incogito window, use secret icon */}
                {/* {current ?? current} */}
              </span>
            </div>
          </div>
          <div className="m-2 min-w-1 flex-initial">{"<title input>"}</div>
        </div>
        {/* collection/window actions */}
        <div className="flex items-center space-x-2">buttons...</div>
      </div>
      <div className="scrollbar relative flex-auto overflow-y-scroll">
        <div className="right-mask relative overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
export const Content = ({}) => {
  const { current } = useGlobalCtx()
  // const { selectedList, tabsByWindowMap, onSelect, setTabsByWindow } =
  // 	useOperationsContext()

  // // 使用 useMemo 优化 windowList 计算，只在 current 变化时重新计算

  if (!current) return <h1>loading</h1>

  // const windowList = useMemo(() => {
  //   return current?.windows ?? []
  // }, [current])

  // if (!state.current) return <h1>loading</h1>

  // collection
  return (
    <ContentLayout
      current={current}
      // selectedList={selectedList}
      // type={type}
    >
      {/* <Sortable list={windowList} listId={current.id}> */}
      {/*   {windowList.map((window) => ( */}
      {/*     <List */}
      {/*       key={window.id} */}
      {/*       window={window} */}
      {/*       type={type} */}
      {/*       onSelect={onSelect} */}
      {/*       selectedMap={tabsByWindowMap} */}
      {/*       setWindowTabs={setTabsByWindow} */}
      {/*     ></List> */}
      {/*   ))} */}
      {/* </Sortable> */}
    </ContentLayout>
  )
}
