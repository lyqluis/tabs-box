import { useCallback, useEffect, useRef } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import { useDialog } from "~tabs/components/Dialog/DialogContext"
import {
  addCollection,
  addTabs,
  addWindow,
  removeCollection,
  setCollectionWithLocalStorage,
  setCurrentId,
  updateCollection,
  updateEditedList
} from "~tabs/components/reducers/actions"
import { toast } from "~tabs/components/Toast"
import { useSelectContext } from "~tabs/contexts/selectContext"
import {
  createClippedItem,
  popFromClipboard,
  pushToClipboard
} from "~tabs/utils/clipboard"
import { cloneCollection, createCollection } from "~tabs/utils/data"
import { closeWindow, jumptToWindow, openWindow } from "~tabs/utils/platform"
import { cloneTab } from "~tabs/utils/tab"
import { cloneWindow, createWindow, formatWindow } from "~tabs/utils/window"

const useOperations = () => {
  // window
  // - save as new collection
  // - save to collection
  // - go to window
  // - close window
  // collectioin
  // - pinned
  // - edit title
  // - clone collection
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

  const saveCurrentToCollection = (collection?) => {
    const formatedWindow = cloneWindow(current)
    // save window to existed collection
    if (collection) {
      dispatch(
        addWindow({ window: formatedWindow, collectionId: collection.id })
      )
      dispatch(setCurrentId(collection.id))
      return
    }
    // save window as new collection
    collection = createCollection(formatedWindow)
    dispatch(addCollection(collection))
    dispatch(setCurrentId(collection.id))
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
                  saveCurrentToCollection(collection)
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

  // clone collection
  const clone = () => {
    const collection = cloneCollection(current)
    dispatch(addCollection(collection))
  }

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
    dispatch(updateCollection(current))
  }

  const goToWindow = () => {
    jumptToWindow(current.id)
  }

  const setCollectionTitle = (title) => {
    current.title = title
    dispatch(updateCollection(current))
  }

  const activeTitleInput = (ref) => {
    return () => ref.current.active()
  }

  // can not get latest selectedList value, so use a ref to get lastest value
  const selectedRef = useRef(null)
  useEffect(() => {
    // console.log("useOperations @selectedList", selectedList, tabsByWindowMap)
    selectedRef.current = { selectedList, tabsByWindowMap }
  }, [selectedList])

  const copy = ({ value, type }) => {
    const res = pushToClipboard(createClippedItem(value, type))
    const msg = type === "collection" ? "" : "selected"
    // todo: [enhance] if copy item is single tab, copy tab's url to system's clipboard
    res && toast.current.show({ title: `Copied ${msg}!`, message: "" })
  }

  const paste = (target: Collection | Window) => {
    const item = popFromClipboard()
    if (item) {
      console.log("get item from clipboard", item, "to", target)

      const { data, type } = item
      // target is colletion, add new window to the target
      if ("created" in target) {
        // target.created existed, target is collection
        if (type === "window") {
          // console.log("paste window")
          let window = data
          window = cloneWindow(window, target.id)
          dispatch(addWindow({ window, collectionId: target.id }))
        } else if (type === "collection") {
          // console.log("paste collection")
          const collection = data
          const windows = collection.windows
          windows.map((window) => {
            const clonedwindow = cloneWindow(window)
            dispatch(
              addWindow({ window: clonedwindow, collectionId: target.id })
            )
          })
        } else if (type === "tab") {
          // console.log("paste selected tabs")
          const tabs = data
          const window = createWindow(tabs, target.id)
          dispatch(addWindow({ window, collectionId: target.id }))
        }

        // notify to save or save directly
        dispatch(
          updateEditedList({
            type: "collection",
            id: target.id,
            isEdited: true
          })
        )
      } else {
        // target is window
        // get all tabs in data, add tabs to the window
        let allTabs = data // data is tabs
        if (type === "collection") {
          allTabs = data.windows.reduce((tabs, window) => {
            tabs.push(...window.tabs)
            return tabs
          }, [])
        } else if (type === "window") {
          allTabs = data.tabs
        }

        // clone all tabs to target window
        allTabs = allTabs.map((tab) => cloneTab(tab, target.id))
        dispatch(
          addTabs({
            tabs: allTabs,
            windowId: target.id,
            collectionId: currentId
          })
        )

        // notify to save or save directly
        dispatch(
          updateEditedList({
            type: "collection",
            id: current.id,
            isEdited: true
          })
        )
      }
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
    saveCurrentToCollection,
    deleteCollection,
    openChooseCollectionDialog,
    activeTitleInput,
    setCollectionTitle,
    copy,
    paste,
    clone
  }
}

export default useOperations
