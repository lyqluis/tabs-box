import { useRefresh } from "~tabs/hooks/useRefresh"
import useSeletedList from "~tabs/hooks/useSelect"
import { fromNow } from "~tabs/utils"
import { closeWindow, CURRENT_WINDOW, openWindow } from "~tabs/utils/platform"
import { formatedWindow } from "~tabs/utils/window"

import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import { List } from "./list"
import {
  removeCollection,
  setCollectionWithLocalStorage,
  setCurrentId,
  updateEditedList
} from "./reducers/actions"
import TitleInput from "./TitleInput"

const ContentLayout = ({ selectedItem, children }) => {
  const {
    state: { windows, collections },
    dispatch
  } = useGlobalCtx()
  const { selectedList } = useSeletedList(selectedItem.id)
  const { openDialog } = useDialog()
  const type = selectedItem.created ? "collection" : "window"
  const allTabsNumber =
    type === "collection"
      ? selectedItem.windows.reduce((n, window) => (n += window.tabs.length), 0)
      : selectedItem.tabs.length
  const saveCollection = (collection?) => {
    if (collection) {
      // save window to existed collection
      const existedWindows = collection.windows
      collection.windows = [...existedWindows, formatedWindow(selectedItem)]
    }
    // save window as new collection
    collection = collection ?? formatedWindow(selectedItem)
    dispatch(setCollectionWithLocalStorage(collection))
  }
  const openCollection = async () => {
    const { windows } = selectedItem
    let newWindowId
    windows &&
      (await windows.map(
        async (window) => (newWindowId = await openWindow(window))
      ))
    // TODO can't get new window id right now
    dispatch(setCurrentId(newWindowId))
  }
  const deleteCollection = () => {
    openDialog({
      title: "Warn",
      message: `collection ${selectedItem.title} will be permanently deleted`,
      onConfirm: () => dispatch(removeCollection(selectedItem))
    })
  }
  const setCollectionTitle = (title) => {
    console.log("set collection title", title)
    selectedItem.title = title
    dispatch(setCollectionWithLocalStorage(selectedItem))
  }
  const deleteWindow = () => {
    openDialog({
      title: "Warn",
      message: `Target window will be permanently closed`,
      onConfirm: () => closeWindow(selectedItem.id)
    })
  }
  const deleteWindowOrCollection = () => {
    if (type === "collection") {
      deleteCollection()
    } else {
      deleteWindow()
    }
  }

  const { RefreshBtn } = useRefresh()

  return (
    <div className="flex flex-auto flex-col overflow-hidden">
      <div className="flex-none">
        <div className="title-container flex items-center">
          <div className="avatar placeholder flex-none shrink-0 grow-0">
            <div className="w-12 rounded-full bg-neutral text-neutral-content">
              <span className="text-xl">
                {/* // TODO type is window, use window icon, type is incogito window, use secret icon */}
                {selectedItem.title && selectedItem.title[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="title__detail m-2">
            <TitleInput
              title={
                selectedItem.title ??
                (selectedItem.id === CURRENT_WINDOW.id
                  ? "This Window"
                  : "Window")
              }
              disable={type === "window"}
              setTitle={setCollectionTitle}
            ></TitleInput>
            <p className="my-2">
              {selectedList.length > 0 && (
                <span>{selectedList.length} selected / </span>
              )}
              <span>{allTabsNumber} tabs</span> | Updated{" "}
              {fromNow(selectedItem.updated)}
            </p>
          </div>
        </div>

        {/* open */}
        {type === "collection" ? (
          <button
            className="btn btn-outline btn-primary p-2"
            onClick={openCollection}
          >
            open
          </button>
        ) : (
          // save
          <div className="join">
            <button
              className="btn btn-outline btn-primary join-item p-2"
              onClick={() => saveCollection()}
            >
              save as new collection
            </button>
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-outline btn-primary join-item p-2"
              >
                save to collection
              </div>
              <ul
                tabIndex={0}
                className="max-h-[calc(100vh / 2)] menu dropdown-content z-[1] flex-col flex-nowrap overflow-y-scroll rounded-box bg-base-100 p-2 shadow"
              >
                {collections.map((collection) => (
                  <li
                    onClick={() => saveCollection(collection)}
                    key={collection.id}
                  >
                    <a>{collection.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* delete */}
        <button
          className="btn btn-outline btn-primary p-2"
          onClick={deleteWindowOrCollection}
        >
          delete
        </button>
        {/* refresh */}
        <RefreshBtn></RefreshBtn>
      </div>
      <div className="flex-auto overflow-y-scroll">{children}</div>
    </div>
  )
}

const Content = ({}) => {
  const {
    state: { current },
    dispatch
  } = useGlobalCtx()

  if (!current) return <h1>loading</h1>

  const type = current.created ? "collection" : "window"
  const dispatchEdit = (isEdited) => {
    dispatch(updateEditedList({ id: current.id, type, isEdited }))
  }

  // window
  if (current.tabs) {
    return (
      <>
        <ContentLayout selectedItem={current}>
          <List window={current} type={type} dispatchEdit={dispatchEdit}></List>
        </ContentLayout>
      </>
    )
  }

  // collection
  const list = current.windows
  return (
    <>
      <ContentLayout selectedItem={current}>
        {list.map((window) => (
          <List
            key={window.id}
            window={window}
            type={type}
            dispatchEdit={dispatchEdit}
          ></List>
        ))}
      </ContentLayout>
    </>
  )
}

export default Content
