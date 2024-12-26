import { useEffect, useRef, useState } from "react"

import { useSelectContext } from "~tabs/contexts/selectContext"
import useOperations from "~tabs/hooks/useOperations"
import { useRefresh } from "~tabs/hooks/useRefresh"
import { fromNow } from "~tabs/utils"
import {
  closeWindow,
  CURRENT_WINDOW,
  jumptToWindow,
  openWindow
} from "~tabs/utils/platform"
import { formatedWindow } from "~tabs/utils/window"

import DropDownActionButton from "./CollectionButtons"
import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import { Sortable } from "./Dnd"
import useDropdown from "../hooks/useDropdown"
import { List } from "./list"
import { updateEditedList } from "./reducers/actions"
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
  const {
    goToWindow,
    deleteWindow,
    openCollection,
    pinnedCollection,
    saveCollection,
    deleteCollection,
    // activeTitleInput,
    // CollectionTitle
    setCollectionTitle,
    openChooseCollectionDialog
  } = useOperations()
  const {
    Dropdown: MoveSelectedDropdown,
    toggleRef: moveSelectedToggleRef,
    handleToggle: handleMoveSelectedToggle
  } = useDropdown()
  const {
    Dropdown: SaveDropdown,
    toggleRef: SaveToggleRef,
    handleToggle: handleSaveToggle
  } = useDropdown()
  const deleteWindowOrCollection = () => {
    if (type === "collection") {
      deleteCollection()
    } else {
      deleteWindow()
    }
  }
  const inputRef = useRef(null)
  const { RefreshBtn } = useRefresh()

  // cancel selected outside
  const ContentLayoutRef = useRef(null)
  const { setSelected, openSelected, deleteSelected, addSelectedToCollection } =
    useSelectContext()
  const cancelAllSelected = (e) => {
    const contentNode = ContentLayoutRef.current
    const outsideNodes = [
      contentNode.children[0],
      contentNode.children[1], // selected actions
      contentNode.children[2], // windows
      contentNode.children[2].children[0]
    ]
    if (outsideNodes.includes(e.target)) {
      setSelected({ checked: false })
    }
  }

  // selected actions
  const SelectedOperations = (
    <div
      className={`btn-wrapper flex-none ${selectedList.length > 0 ? "flex" : "invisible"} h-8 pl-5`}
    >
      {/* open */}
      {type === "collection" && (
        <button className="btn btn-xs m-1" onClick={openSelected}>
          open selected
        </button>
      )}
      {/* remove */}
      <button className="btn btn-xs m-1" onClick={deleteSelected}>
        {type === "collection" ? "remove selected" : "close selected"}
      </button>
      {/* move */}
      <button
        ref={moveSelectedToggleRef}
        className="btn btn-xs m-1"
        onClick={() => handleMoveSelectedToggle()}
      >
        move selected
      </button>
      <MoveSelectedDropdown>
        {collections
          .filter((c) => c.id !== selectedItem.id)
          .map((collection) => (
            <li
              onClick={() => addSelectedToCollection(collection.id)}
              key={collection.id}
            >
              <a>{collection.title}</a>
            </li>
          ))}
      </MoveSelectedDropdown>
    </div>
  )

  return (
    <div
      ref={ContentLayoutRef}
      className="flex flex-auto flex-col overflow-hidden"
      style={{ background: "#FFD700" }}
      onClick={cancelAllSelected}
    >
      <div className="flex flex-none justify-between px-5 pb-0 pt-8">
        {/* title */}
        <div className="flex min-w-1 flex-1 items-center">
          <div className="avatar placeholder flex-none shrink-0 grow-0">
            <div className="w-12 rounded-full bg-neutral text-neutral-content">
              <span className="text-xl">
                {/* // TODO type is window, use window icon, type is incogito window, use secret icon */}
                {selectedItem.title && selectedItem.title[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="m-2 min-w-1 flex-initial">
            <TitleInput
              ref={inputRef}
              title={
                selectedItem.title ??
                (isCurrentWindow ? "This Window" : "Window")
              }
              disable={type === "window"}
              setTitle={setCollectionTitle}
            ></TitleInput>
            {/* {CollectionTitle} */}
            <p className="my-2">
              {selectedList.length > 0 && (
                <span>{selectedList.length} selected / </span>
              )}
              <span>{allTabsNumber} tabs</span> | Updated{" "}
              {fromNow(selectedItem.updated)}
            </p>
          </div>
        </div>
        {/* // TODO: reponsiable in small window, buttons shrink to be one */}
        {/* collection/window actions */}
        <div className="flex items-center space-x-2">
          {/* go to */}
          {type === "window" && windows.length > 1 && !isCurrentWindow && (
            <button
              className="btn btn-outline btn-primary hidden p-2 sm:block"
              onClick={goToWindow}
            >
              go to
            </button>
          )}
          {/* open */}
          {type === "collection" ? (
            <button
              className="btn btn-outline btn-primary hidden p-2 sm:block"
              onClick={openCollection}
            >
              open
            </button>
          ) : (
            // save
            <div className="join join-vertical hidden lg:join-horizontal lg:block">
              <button
                className="btn btn-outline btn-primary join-item p-2"
                onClick={() => saveCollection()}
              >
                save as new collection
              </button>
              <button
                ref={SaveToggleRef}
                className="btn btn-outline btn-primary join-item p-2"
                onClick={() => handleSaveToggle()}
              >
                save to collection
              </button>
              <SaveDropdown>
                {collections.map((collection) => (
                  <li
                    onClick={() => saveCollection(collection)}
                    key={collection.id}
                  >
                    <a>{collection.title}</a>
                  </li>
                ))}
              </SaveDropdown>
            </div>
          )}
          {/* delete */}
          <button
            className="btn btn-outline btn-primary hidden p-2 sm:block"
            onClick={deleteWindowOrCollection}
          >
            {type === "window" ? "close" : "delete"}
          </button>
          {/* // TODO: reponsiable in small window, buttons shrink to be one */}
          {/* actions in small screen */}
          <DropDownActionButton
            inputRef={inputRef}
            // ? hidden in large screen
            // className="btn block p-2 lg:hidden"
            className="btn block p-2"
          ></DropDownActionButton>
          {/* refresh */}
          <RefreshBtn></RefreshBtn>
        </div>
      </div>
      {SelectedOperations}
      <div className="scrollbar relative flex-auto overflow-y-scroll">
        <div className="right-mask relative overflow-hidden">{children}</div>
      </div>
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

  const { selectedList, tabsByWindowMap, onSelect, setTabsByWindow } =
    useSelectContext()

  // set list for sortable
  const [windowList, setWindowList] = useState(current?.windows ?? [])
  useEffect(() => {
    setWindowList(current?.windows ?? [])
  }, [current, collections])

  if (!current) return <h1>loading</h1>

  const dispatchEdit = (isEdited) => {
    dispatch(updateEditedList({ id: currentId, type, isEdited }))
  }

  // window
  if (current.tabs) {
    return (
      <>
        <ContentLayout
          selectedItem={current}
          selectedList={selectedList}
          type={type}
        >
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
