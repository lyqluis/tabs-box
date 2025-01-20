import { useMemo } from "react"
import Computer from "react:~assets/svg/computer.svg"
import Copy from "react:~assets/svg/copy.svg"
import Cross from "react:~assets/svg/cross.svg"
import Delete from "react:~assets/svg/delete.svg"
import Edit from "react:~assets/svg/edit.svg"
import FolderPlus from "react:~assets/svg/folder-plus.svg"
import Folder from "react:~assets/svg/folder.svg"
import Logout from "react:~assets/svg/logout.svg"
import More from "react:~assets/svg/more.svg"
import Package from "react:~assets/svg/package-add.svg"
import Paste from "react:~assets/svg/paste.svg"
import PinOutline from "react:~assets/svg/pin-outline.svg"

import { useSelectContext } from "~tabs/contexts/selectContext"
import useOperations from "~tabs/hooks/useOperations"
import { CURRENT_WINDOW } from "~tabs/utils/platform"

import useDropdown from "../hooks/useDropdown"
import { useGlobalCtx } from "./context"
import Icon from "./Icon"

const DropDownActionButton = ({ className, inputRef }) => {
  const {
    current,
    type,
    state: { collections }
  } = useGlobalCtx()
  const { selectedList, tabsByWindowMap } = useSelectContext()
  const {
    goToWindow,
    deleteWindow,
    openCollection,
    pinnedCollection,
    saveCurrentToCollection,
    deleteCollection,
    activeTitleInput,
    openChooseCollectionDialog,
    copy,
    paste,
    clone
  } = useOperations()

  const warnClassName = "text-red-500 fill-red-500"
  const isCurrentWindow = current.id === CURRENT_WINDOW.id

  const windowMenu = useMemo(() => {
    return [
      {
        text: "go to window",
        icon: (
          <Icon Svg={Logout} type={isCurrentWindow ? "disabled" : undefined} />
        ),
        callback: goToWindow,
        disabled: isCurrentWindow,
        includes: ["window"]
      },
      {
        text: "save as new collection",
        icon: <Icon Svg={FolderPlus} />,
        callback: () => saveCurrentToCollection(),
        includes: ["window"]
      },
      {
        text: "save to collection",
        icon: <Icon Svg={Folder} />,
        callback: openChooseCollectionDialog,
        includes: ["window"]
      },
      {
        text: "close window",
        icon: <Icon Svg={Cross} type="warn" />,
        callback: deleteWindow,
        includes: ["window"],
        warn: true
      }
    ]
  }, [isCurrentWindow])

  const collectionMenu = useMemo(() => {
    return [
      {
        text: current.pinned ? "unpin" : "pin",
        icon: <Icon Svg={PinOutline} />,
        callback: pinnedCollection,
        includes: ["collection"]
      },
      {
        text: "edit title",
        icon: <Icon Svg={Edit} />,
        callback: activeTitleInput(inputRef),
        includes: ["collection"]
      },
      {
        text: "open collection",
        icon: <Icon Svg={Computer} />,
        callback: openCollection,
        includes: ["collection"]
      },
      {
        text: "delete collection",
        icon: <Icon Svg={Delete} type="warn" />,
        callback: deleteCollection,
        includes: ["collection"],
        warn: true
      }
    ]
  }, [current, collections])

  const selectedMenu = useMemo(() => {
    let copyText = "copy"
    let copyItem = { value: current, type: type }
    if (selectedList?.length) {
      copyText = "copy selected"
      copyItem = { value: selectedList, type: "tab" }
      if (tabsByWindowMap.size === 1) {
        const [[windowId, tabs]] = tabsByWindowMap.entries()
        const window =
          type === "window"
            ? current
            : current.windows.find((w) => w.id === windowId)
        if (window && tabs?.length === window.tabs.length) {
          copyText = "copy window"
          copyItem = { value: window, type: "window" }
        }
      }
    }

    return [
      {
        text: copyText,
        icon: <Icon Svg={Copy} />,
        callback: () => copy(copyItem)
      },
      // enhance: if clipboard is empty, disabled
      {
        text: "paste",
        icon: <Icon Svg={Paste} />,
        callback: () => paste(current)
      },
      {
        text: "clone",
        icon: <Icon Svg={Package} />,
        callback: clone,
        includes: ["collection"]
      }
    ]
  }, [selectedList])

  const menuList: any[] = useMemo(() => {
    const separator = { separator: true, key: "selected-tabs" }
    const menu =
      type === "window"
        ? [...windowMenu, separator, ...selectedMenu]
        : [...collectionMenu, separator, ...selectedMenu]
    return menu
  }, [collectionMenu, windowMenu, selectedMenu])

  const { Dropdown, toggleRef, handleToggle } = useDropdown({
    menuPosition: "right"
  })

  return (
    <>
      <button
        ref={toggleRef}
        className={className}
        onClick={() => handleToggle()}
      >
        <Icon Svg={More} />
      </button>
      <Dropdown>
        {/* // todo: delete */}
        {/* <li className="menu-title">Window</li> */}
        {menuList.map((item) => {
          if (item.separator) {
            return (
              <li
                className="h-0.5 border-b-[1px] border-gray-300"
                key={item.key}
              ></li>
            )
          }
          return (
            <li
              key={item.text}
              className={`${item.disabled ? "disabled" : ""} ${item.warn ? warnClassName : ""}`}
            >
              <a onClick={item.callback}>
                {item.icon}
                {item.text}
              </a>
            </li>
          )
        })}
      </Dropdown>
    </>
  )
}

export default DropDownActionButton
