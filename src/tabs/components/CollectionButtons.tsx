import { useMemo, useState } from "react"
import Computer from "react:~assets/svg/computer.svg"
import Copy from "react:~assets/svg/copy.svg"
import Cross from "react:~assets/svg/cross.svg"
import Delete from "react:~assets/svg/delete.svg"
import Edit from "react:~assets/svg/edit.svg"
import FolderPlus from "react:~assets/svg/folder-plus.svg"
import Folder from "react:~assets/svg/folder.svg"
import Logout from "react:~assets/svg/logout.svg"
import More from "react:~assets/svg/more.svg"
import Paste from "react:~assets/svg/paste.svg"
import PinOutline from "react:~assets/svg/pin-outline.svg"

import useActions from "~tabs/hooks/useActions"
import { CURRENT_WINDOW } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import Dropdown from "./DropDown"

const DropDownActionButton = ({ className, inputRef }) => {
  const { current, type } = useGlobalCtx()
  const {
    goToWindow,
    deleteWindow,
    openCollection,
    pinnedCollection,
    saveCollection,
    deleteCollection,
    activeTitleInput,
    openChooseCollectionDialog,
    copy,
    paste
  } = useActions()

  const iconClassName = "h-full w-full fill-slate-700"
  const warnClassName = "text-red-500 fill-red-500"

  const svg = <More className={iconClassName}></More>
  const isCurrentWindow = current.id === CURRENT_WINDOW.id

  const menu = [
    // window
    {
      text: "go to window",
      icon: <Logout className={iconClassName} />,
      callback: goToWindow,
      disabled: isCurrentWindow,
      includes: ["window"]
    },
    {
      text: "save as new collection",
      icon: <Folder className={iconClassName} />,
      callback: () => saveCollection(),
      includes: ["window"]
    },
    {
      text: "save to collection",
      icon: <FolderPlus className={iconClassName} />,
      callback: openChooseCollectionDialog,
      includes: ["window"]
    },
    {
      text: "close window",
      icon: <Cross className={iconClassName + " " + warnClassName} />,
      callback: deleteWindow,
      includes: ["window"],
      warn: true
    },
    // collectioin
    {
      text: current.pinned ? "unpin" : "pin",
      icon: <PinOutline className={iconClassName} />,
      callback: pinnedCollection,
      includes: ["collection"]
    },
    {
      text: "edit title",
      icon: <Edit className={iconClassName} />,
      callback: activeTitleInput(inputRef),
      includes: ["collection"]
    },
    {
      text: "open collection",
      icon: <Computer className={iconClassName} />,
      callback: openCollection,
      includes: ["collection"]
    },
    {
      text: "delete collection",
      icon: <Delete className={iconClassName + " " + warnClassName} />,
      callback: deleteCollection,
      includes: ["collection"],
      warn: true
    },
    // TODO selected tabs actions
    { separator: true, key: "selected-tabs" },
    // other
    { text: "copy", icon: <Copy className={iconClassName} /> },
    { text: "paste", icon: <Paste className={iconClassName} /> }
  ]
  const menuList = useMemo(() => {
    // window
    const windowMenu = [
      {
        text: "go to window",
        icon: <Logout className={iconClassName} />,
        callback: goToWindow,
        disabled: isCurrentWindow,
        includes: ["window"]
      },
      {
        text: "save as new collection",
        icon: <FolderPlus className={iconClassName} />,
        callback: () => saveCollection(),
        includes: ["window"]
      },
      {
        text: "save to collection",
        icon: <Folder className={iconClassName} />,
        callback: openChooseCollectionDialog,
        includes: ["window"]
      },
      {
        text: "close window",
        icon: <Cross className={iconClassName + " " + warnClassName} />,
        callback: deleteWindow,
        includes: ["window"],
        warn: true
      }
    ]
    // collection
    const collectionMenu = [
      {
        text: current.pinned ? "unpin" : "pin",
        icon: <PinOutline className={iconClassName} />,
        callback: pinnedCollection,
        includes: ["collection"]
      },
      {
        text: "edit title",
        icon: <Edit className={iconClassName} />,
        callback: activeTitleInput(inputRef),
        includes: ["collection"]
      },
      {
        text: "open collection",
        icon: <Computer className={iconClassName} />,
        callback: openCollection,
        includes: ["collection"]
      },
      {
        text: "delete collection",
        icon: <Delete className={iconClassName + " " + warnClassName} />,
        callback: deleteCollection,
        includes: ["collection"],
        warn: true
      }
    ]
    const selectedMenu = [
      {
        text: "copy",
        icon: <Copy className={iconClassName} />,
        callback: copy
      },
      {
        text: "paste",
        icon: <Paste className={iconClassName} />,
        callback: () => paste(current)
      }
    ]
    const separator = { separator: true, key: "selected-tabs" }
    const menu =
      type === "window"
        ? [...windowMenu, separator, ...selectedMenu]
        : [...collectionMenu, separator, ...selectedMenu]
    return menu
  }, [current])

  return (
    <Dropdown buttonSvg={svg} buttonClassName={className} menuPosition="right">
      <li className="menu-title">Window</li>
      {menuList
        // TODO add disabled class
        .map((item) => {
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
                <i className="h-5">{item.icon}</i>
                {item.text}
              </a>
            </li>
          )
        })}
    </Dropdown>
  )
}

export default DropDownActionButton
