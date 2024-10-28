import { useCallback, useMemo, useRef } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import { useDialog } from "~tabs/components/Dialog/DialogContext"
import {
  removeCollection,
  setCollection,
  setCollectionWithLocalStorage,
  setCurrentId
} from "~tabs/components/reducers/actions"
import TitleInput from "~tabs/components/TitleInput"
import {
  closeWindow,
  CURRENT_WINDOW,
  jumptToWindow,
  openWindow
} from "~tabs/utils/platform"
import { formatedWindow } from "~tabs/utils/window"

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
  const titleInputRef = useRef(null)

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
  }
}

export default useActions
