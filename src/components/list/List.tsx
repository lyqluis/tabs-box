import CopyIcon from "@/assets/svg/copy.svg?react"
import DeleteIcon from "@/assets/svg/delete.svg?react"
import DragableIcon from "@/assets/svg/dragable.svg?react"
import IncognitoSvg from "@/assets/svg/incognito.svg?react"
import PasteIcon from "@/assets/svg/paste.svg?react"
import ShareIcon from "@/assets/svg/share.svg?react"
import WindowIcon from "@/assets/svg/window.svg?react"
import { useOperationsContext } from "@/components/contexts/operationsContext"
import { openWindow } from "@/utils/platform"
import { memo, useEffect, useMemo, useRef } from "react"

import { ListItem } from "."
import { useGlobalCtxSelector } from "../data/context2"
import { Sortable, useDndSelector, useSortableItem } from "../Dnd"
import Icon from "../Icon"
import { removeWindow } from "../reducers/actions"
import { useSettings } from "../setting/settingContext"

interface ListProps {
  window: Window // from <windows[] | collection.windows[]>
  type?: "window" | "collection" // window | collection
  selectedMap?: any
  // selectedList?: chrome.tabs.Tab[]
  dispatchEdit?: (isEdited?: boolean) => void
  onSelect?: (any: any) => void
  setWindowTabs?: (id: WindowId, tabs: Tab[]) => void
}
const Favicon = memo(
  ({ url }: { url: string }) => {
    return <img src={url} alt="" className="w-4" />
  },
  (prevProps, nextProps) => {
    return prevProps.url === nextProps.url
  },
)

// TODO: any operation on the list should be push into history stack
const List: React.FC<ListProps> = ({
  window,
  type,
  selectedMap,
  onSelect,
  setWindowTabs,
}) => {
  // 使用 useMemo 优化 pinnedTabs 和 tabs 的计算
  const pinnedTabs = useMemo(() => {
    return window?.tabs?.filter((tab) => tab.pinned) ?? []
  }, [window?.tabs])

  const tabs = useMemo(() => {
    return window?.tabs?.filter((tab) => !tab.pinned) ?? []
  }, [window?.tabs])

  const current = useGlobalCtxSelector((v) => v.current)
  const dispatch = useGlobalCtxSelector((v) => v.dispatch)
  const draggingItem = useDndSelector((v) => v.draggingItem)
  const { copy, paste } = useOperationsContext()
  // const { settings } = useSettings()

  const allCheckBox = useRef(null)
  const selectedList = selectedMap.get(window.id) ?? [] // otherwise multiList in sortable will fail

  // 创建 selectedIds 的 Set 以优化查找性能
  const selectedIdsSet = useMemo(() => {
    return new Set(selectedList.map((tab) => tab.id))
  }, [selectedList])

  const selectAll = (e) => {
    const selectedCount = selectedList.length
    if (selectedCount === window.tabs.length) {
      // remove all
      setWindowTabs(window.id, [])
    } else {
      // select all
      setWindowTabs(window.id, window.tabs)
    }
  }

  useEffect(() => {
    const selectCount = selectedList.length
    if (!allCheckBox.current) return
    if (selectCount > 0 && selectCount < window.tabs.length) {
      allCheckBox.current.indeterminate = true
    } else {
      allCheckBox.current.indeterminate = false
    }
  }, [selectedList.length, window.tabs.length])

  const { attributes, listeners, setNodeRef, style } = useSortableItem({
    id: window.id,
  })

  const windowIcon = (
    <Icon
      Svg={window.incognito ? IncognitoSvg : WindowIcon}
      className="flex h-full w-5 flex-none group-hover:hidden"
    />
  )

  if ((!pinnedTabs || !pinnedTabs.length) && (!tabs || !tabs.length))
    return null

  return (
    <div
      className="relative py-3 pl-5 text-clip first:pt-4 [contain:content]"
      ref={setNodeRef}
      style={{
        ...style,
        opacity: draggingItem?.id === window.id ? 0.5 : 1,
      }}
    >
      {/* list operation */}
      <div
        // FIX: sticky not work, because wrapper's right-mask need overflow-hidden
        className={`sticky top-0 mt-4 mb-4 flex h-5 items-center justify-start ${type === "window" ? "pl-5" : ""} pr-3`}
      >
        {/* draggable */}
        {type === "collection" && (
          <Icon
            Svg={DragableIcon}
            className="list-item__handle flex h-5 w-5 flex-none items-center justify-start fill-slate-300 outline-none hover:cursor-grab focus:cursor-grabbing dark:fill-slate-600"
            {...attributes}
            {...listeners}
          />
        )}
        <div className="group flex">
          <label className="label hidden cursor-pointer group-hover:inline-flex">
            <input
              ref={allCheckBox}
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={selectedList.length === window.tabs.length}
              onChange={selectAll}
            />
          </label>
          {windowIcon}
        </div>
        <span className="ml-2 text-base font-bold">Window</span>
        {/* {settings?.dev && `: ${window.id}`} */}
        {/* quick action */}
        {type === "collection" && (
          <>
            <div className="tooltip" data-tip="open window">
              <button
                className="btn btn-xs m-1"
                onClick={() => openWindow(window)}
              >
                <Icon Svg={ShareIcon} width={4} height={4} />
              </button>
            </div>
            <div className="tooltip" data-tip="copy window">
              <button
                className="btn btn-xs m-1"
                onClick={() => copy({ value: window, type: "window" })}
              >
                <Icon Svg={CopyIcon} width={4} height={4} />
              </button>
            </div>

            <div className="tooltip" data-tip="paste to window">
              <button className="btn btn-xs m-1" onClick={() => paste(window)}>
                <Icon Svg={PasteIcon} width={4} height={4} />
              </button>
            </div>
            <div className="tooltip" data-tip="delete window">
              <button
                className="btn btn-xs m-1"
                onClick={() => {
                  dispatch(
                    removeWindow({
                      windowId: window.id,
                      collectionId: current.id,
                    }),
                  )
                }}
              >
                <Icon Svg={DeleteIcon} width={4} height={4} />
              </button>
            </div>
          </>
        )}
      </div>
      {/* tabs */}
      <Sortable list={window?.tabs} listId={window.id}>
        {/* pinned tabs */}
        {pinnedTabs.map((tab, i) => {
          return !tab.hidden ? (
            <ListItem
              tab={tab}
              key={`${window.id}-${tab.url}-${i}`}
              checked={selectedIdsSet.has(tab.id)}
              onSelect={onSelect}
              type={type}
            ></ListItem>
          ) : null
        })}
        {/* non-pinned tabs */}
        {tabs?.map((tab, i) => {
          return !tab.hidden ? (
            <ListItem
              tab={tab}
              key={`${window.id}-${tab.url}-${i}`}
              checked={selectedIdsSet.has(tab.id)}
              onSelect={onSelect}
              type={type}
            ></ListItem>
          ) : null
        })}
      </Sortable>
    </div>
  )
}

export default memo(List)
