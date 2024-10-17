import { useEffect, useRef, useState } from "react"

import { useRefresh } from "~tabs/hooks/useRefresh"
import { useSelectContext } from "~tabs/hooks/useSelect"
import { fromNow } from "~tabs/utils"
import {
  closeWindow,
  CURRENT_WINDOW,
  jumptToWindow,
  openWindow
} from "~tabs/utils/platform"
import { formatedWindow } from "~tabs/utils/window"

import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import { Sortable } from "./Dnd"
import DropDown from "./DropDown"
import { List } from "./list"
import {
  removeCollection,
  setCollectionWithLocalStorage,
  setCurrentId,
  updateEditedList
} from "./reducers/actions"
import TitleInput from "./TitleInput"

const ContentLayout = ({ selectedItem, selectedList, type, children }) => {
  const {
    state: { windows, collections },
    dispatch
  } = useGlobalCtx()
  const { openDialog } = useDialog()
  const allTabsNumber =
    type === "collection"
      ? selectedItem.windows.reduce((n, window) => (n += window.tabs.length), 0)
      : selectedItem.tabs.length
  const isCurrentWindow = selectedItem.id === CURRENT_WINDOW.id
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
  const saveToBtnRef = useRef(null)
  
  // cancel selected outside
  const ContentLayoutRef = useRef(null)
  const { setSelected } = useSelectContext()
  const cancelAllSelected = (e) => {
    const contentNode = ContentLayoutRef.current
    const outsideNodes = [
      contentNode.children[0],
      contentNode.children[1],
      contentNode.children[1].children[0],
      contentNode.children[1].children[1],
      contentNode.children[1].children[1].children[0]
    ]
    if (outsideNodes.includes(e.target)) {
      setSelected({ checked: false })
    }
  }

  return (
    <div
      ref={ContentLayoutRef}
      className="flex flex-auto flex-col overflow-hidden"
      style={{ background: "#FFD700" }}
      onClick={cancelAllSelected}
    >
      <div className="flex-none">
        {/* title */}
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
                (isCurrentWindow ? "This Window" : "Window")
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
        {/* go to */}
        {type === "window" && windows.length > 1 && !isCurrentWindow && (
          <button
            className="btn btn-outline btn-primary p-2"
            onClick={(e) => jumptToWindow(selectedItem.id)}
          >
            go to
          </button>
        )}
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
            <DropDown
              buttonText="save to collection"
              buttonClassName="btn btn-outline btn-primary join-item p-2"
              buttonStyle={{
                borderTopRightRadius: "var(--rounded-btn, .5rem)",
                borderBottomRightRadius: "var(--rounded-btn, .5rem)"
              }}
              ref={saveToBtnRef}
            >
              {collections.map((collection) => (
                <li
                  onClick={() => saveCollection(collection)}
                  key={collection.id}
                >
                  <a>{collection.title}</a>
                </li>
              ))}
            </DropDown>
          </div>
        )}
        {/* delete */}
        <button
          className="btn btn-outline btn-primary p-2"
          onClick={deleteWindowOrCollection}
        >
          {type === "window" ? "close" : "delete"}
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
    state: { collections, currentId },
    current,
    type,
    dispatch
  } = useGlobalCtx()

  const {
    selectedList,
    tabsByWindowMap,
    onSelect,
    setTabsByWindow,
    openSelected,
    deleteSelected,
    addSelectedToCollection
  } = useSelectContext()
  const dropDownRef = useRef(null)
  // set list for sortable
  const [windowList, setWindowList] = useState(current?.windows ?? [])
  useEffect(() => {
    setWindowList(current?.windows ?? [])
  }, [current, collections])

  if (!current) return <h1>loading</h1>

  const dispatchEdit = (isEdited) => {
    dispatch(updateEditedList({ id: currentId, type, isEdited }))
  }
  const handleMoveSelectedClick = (collectionId) => {
    addSelectedToCollection(collectionId)
    dropDownRef.current.close()
  }

  const SelectedOperations = (
    <div
      className={`btn-wrapper ml-auto ${selectedList.length > 0 ? "flex" : "invisible"} h-8`}
    >
      {type === "collection" && (
        <button className="btn btn-xs m-1" onClick={openSelected}>
          open selected
        </button>
      )}
      {/* // TODO bug */}
      <button className="btn btn-xs m-1" onClick={deleteSelected}>
        {type === "collection" ? "remove selected" : "close selected"}
      </button>
      <DropDown buttonText="move selected" ref={dropDownRef}>
        {collections
          .filter((c) => c.id !== currentId)
          .map((collection) => (
            <li
              onClick={() => handleMoveSelectedClick(collection.id)}
              key={collection.id}
            >
              <a>{collection.title}</a>
            </li>
          ))}
      </DropDown>
    </div>
  )

  // window
  if (current.tabs) {
    return (
      <>
        <ContentLayout
          selectedItem={current}
          selectedList={selectedList}
          type={type}
        >
          {SelectedOperations}
          <List
            window={current}
            type={type}
            onSelect={onSelect}
            selectedMap={tabsByWindowMap}
            dispatchEdit={dispatchEdit}
            setWindowTabs={setTabsByWindow}
          ></List>
        </ContentLayout>
      </>
    )
  }
  // collection
  // const list = current.windows
  return (
    <>
      <ContentLayout
        selectedItem={current}
        selectedList={selectedList}
        type={type}
      >
        {SelectedOperations}
        <Sortable list={windowList} listId={current.id}>
          {windowList.map((window) => (
            <List
              key={window.id}
              window={window}
              type={type}
              onSelect={onSelect}
              selectedMap={tabsByWindowMap}
              dispatchEdit={dispatchEdit}
              setWindowTabs={setTabsByWindow}
            ></List>
          ))}
        </Sortable>
        {/* <Tst></Tst> */}
      </ContentLayout>
    </>
  )
}

export default Content
