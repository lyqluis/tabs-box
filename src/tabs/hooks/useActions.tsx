import { useCallback, useEffect, useMemo, useRef } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import { useDialog } from "~tabs/components/Dialog/DialogContext"
import {
  addCopyItems,
  addWindow,
  removeCollection,
  setCollection,
  setCollectionWithLocalStorage,
  setCurrentId,
  updateEditedList
} from "~tabs/components/reducers/actions"
import TitleInput from "~tabs/components/TitleInput"
import { toast } from "~tabs/components/Toast"
import { useSelectContext } from "~tabs/contexts/selectContext"
import {
  createClippedItem,
  popFromClipboard,
  pushToClipboard
} from "~tabs/utils/clipboard"
import {
  closeWindow,
  CURRENT_WINDOW,
  jumptToWindow,
  openWindow
} from "~tabs/utils/platform"
import { createWindow, formatedWindow } from "~tabs/utils/window"

import useLatest from "./useLatest"

const useActions = () => {
  // window
  // - save as new collection
  // - save to collection
  // - go to window
  // - close window
  // collectioin
  // - pinned
  // - edit title
  // - open collection
  // - delete collection
  // selected tabs
  // other
  // - copy
  // - paste

  const {
    state: { windows, collections, currentId },
    current,
    type,
    dispatch
  } = useGlobalCtx()
  const { openDialog, closeDialog } = useDialog()
  const { selectedList, tabsByWindowMap, addSelectedToCollection } =
    useSelectContext()

  const saveCollection = (collection?) => {
    if (collection) {
      // save window to existed collection
      const existedWindows = collection.windows
      collection.windows = [...existedWindows, formatedWindow(current)]
    }
    // save window as new collection
    collection = collection ?? formatedWindow(current)
    dispatch(setCollectionWithLocalStorage(collection))
  }

  const openChooseCollectionDialog = useCallback(() => {
    openDialog({
      message: "choose a collection to save",
      title: "Save to collection",
      content: (
        // todo inner shadow only top & bottom
        <div className="max-h-[50vh] overflow-y-auto">
          <ul className="menu">
            <div className="w-full shadow"></div>
            {collections.map((collection) => (
              <li
                onClick={() => {
                  saveCollection(collection)
                  closeDialog()
                }}
                key={collection.id}
              >
                <a>{collection.title}</a>
              </li>
            ))}
          </ul>
        </div>
      ),
      cancelText: "Cancel"
    })
  }, [currentId, collections])

  const openCollection = async () => {
    const { windows } = current
    let newWindowId
    windows &&
      (await windows.map(
        async (window) => (newWindowId = await openWindow(window))
      ))
    // ?? todo can't get new window id right now
    dispatch(setCurrentId(newWindowId))
  }
  const deleteCollection = () => {
    openDialog({
      title: "Warn",
      message: `collection '${current.title}' will be permanently deleted`,
      onConfirm: () => dispatch(removeCollection(current))
    })
  }
  const deleteWindow = () => {
    openDialog({
      title: "Warn",
      message: `Target window will be permanently closed`,
      onConfirm: () => closeWindow(current.id)
    })
  }

  const pinnedCollection = () => {
    current.pinned = !current.pinned
    dispatch(setCollection(current))
  }

  const goToWindow = () => {
    jumptToWindow(current.id)
  }

  const setCollectionTitle = (title) => {
    current.title = title
    dispatch(setCollectionWithLocalStorage(current))
  }

  const activeTitleInput = (ref) => {
    return () => ref.current.active()
  }

  // can not get latest selectedList value, so use a ref to get lastest value
  const selectedRef = useRef(null)
  useEffect(() => {
    // console.log("useActions @selectedList", selectedList, tabsByWindowMap)
    selectedRef.current = { selectedList, tabsByWindowMap }
  }, [selectedList])

  const copy = () => {
    let res, title
    const { selectedList } = selectedRef.current
    if (selectedList.length) {
      // copy selected to clipboard
      res = pushToClipboard(createClippedItem(selectedList, "tab"))
      title = "selected"
    } else {
      // else copy current window/collection
      res = pushToClipboard(createClippedItem(current, type))
      title = type
    }

    // finally show copied message
    res && toast.current.show({ title: `Copied ${title}!`, message: "" })
  }

  const paste = (target: Collection | Window) => {
    const item = popFromClipboard()
    if (item) {
      console.log("get item from clipboard", item)

      // target is colletion, add new window to the target
      const { data, type } = item
      if (type === "window") {
        // console.log("paste window")
        let window = data
        window = createWindow(window.tabs, target.id, window)
        dispatch(addWindow({ window, collectionId: target.id }))
      } else if (type === "collection") {
        // console.log("paste collection")
        const collection = data
        const windows = collection.windows
        windows.map((window) => {
          window = createWindow(window.tabs, target.id, window)
          dispatch(addWindow({ window, collectionId: target.id }))
        })
      } else if (type === "tab") {
        // console.log("paste selected tabs")
        const tabs = data
        const window = createWindow(tabs, target.id)
        dispatch(addWindow({ window, collectionId: target.id }))
      }

      // notify to save or save directly
      dispatch(
        updateEditedList({ type: "collection", id: target.id, isEdited: true })
      )
      // dispatch(setCollectionWithLocalStorage(target))
    } else {
      toast.current.show({
        title: "Clipboard is empty!",
        message: "Please copy some tabs first",
        type: "error"
      })
    }
  }

  return {
    goToWindow,
    deleteWindow,
    openCollection,
    pinnedCollection,
    saveCollection,
    deleteCollection,
    openChooseCollectionDialog,
    activeTitleInput,
    setCollectionTitle,
    copy,
    paste
  }
}

export default useActions
