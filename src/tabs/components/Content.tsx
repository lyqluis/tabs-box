import { fromNow } from "~tabs/utils"

import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import { List } from "./list"
import {
  removeCollection,
  removeTab,
  setCollectionWithLocalStorage,
  setSelectedList
} from "./reducers/actions"
import TitleInput from "./TitleInput"

const ContentLayout = ({ selectedItem, children }) => {
  const {
    state: { selectedList },
    dispatch
  } = useGlobalCtx()
  const { openDialog } = useDialog()
  const type = selectedItem.created ? "collection" : "window"
  const allTabsNumber =
    type === "collection"
      ? selectedItem.windows.reduce((n, window) => (n += window.tabs.length), 0)
      : selectedItem.tabs.length
  const saveCollection = () => {
    dispatch(setCollectionWithLocalStorage(selectedItem))
  }
  const editCollection = () => {
    // dispatch(setCollectionWithLocalStorage(collection))
  }
  const deleteSelected = () => {
    selectedList.map((tab) => dispatch(removeTab(tab.id, tab.windowId)))
    dispatch(setSelectedList([]))
    // TODO type is collection.tab
    // if (type === "collection") {
    //   //...
    // }
    // TODO type is window/collection.window
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

  return (
    <>
      <div className="title-container flex items-center">
        <div className="avatar placeholder flex-none shrink-0 grow-0">
          <div className="w-12 rounded-full bg-neutral text-neutral-content">
            <span className="text-xl">
              {/* // TODO type is window, use window icon */}
              {selectedItem.title && selectedItem.title[0].toUpperCase()}
            </span>
          </div>
        </div>
        <div className="title__detail m-2">
          <TitleInput
            title={selectedItem.title ?? "Window"}
            disable={type === "window"}
            setTitle={setCollectionTitle}
          ></TitleInput>
          <p className="my-2">
            <span>{allTabsNumber} tabs</span> | Updated{" "}
            {fromNow(selectedItem.updated)}
          </p>
        </div>
      </div>
      <button
        className="btn btn-outline btn-primary p-2"
        onClick={saveCollection}
      >
        save to collection
      </button>
      {/* // TODO only shows when selectedItem is collection */}
      <button
        className="btn btn-outline btn-primary p-2"
        onClick={editCollection}
      >
        edit title
      </button>
      {/* if selectedList.length, show delete selected tabs */}
      {type === "collection" ? (
        selectedList.length === 0 ? (
          <button
            className="btn btn-outline btn-primary p-2"
            onClick={deleteCollection}
          >
            delete
          </button>
        ) : (
          <button
            className="btn btn-outline btn-primary p-2"
            onClick={deleteSelected}
          >
            delete selected
          </button>
        )
      ) : (
        ""
      )}
      {children}
    </>
  )
}

const Content = ({}) => {
  const {
    state: { current, windows, collections },
    dispatch
  } = useGlobalCtx()

  if (!current) return <h1>loading</h1>

  // window
  if (current.tabs) {
    return (
      <>
        <ContentLayout selectedItem={current}>
          <List window={current}></List>
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
          <List key={window.id} window={window}></List>
        ))}
      </ContentLayout>
    </>
  )
}

export default Content
