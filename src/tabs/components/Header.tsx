import { useEffect } from "react"

import { applyWindow } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import { importFile } from "./data"
import LoadingBtn from "./LoadingBtn"
import {
  exportData,
  importData,
  setCollectionWithLocalStorage,
  updateEditedList
} from "./reducers/actions"
import { toast } from "./Toast"

const Header = () => {
  const {
    state: { current, editedMap },
    dispatch
  } = useGlobalCtx()

  if (!current) return null

  const type = current?.created ? "collection" : "window"
  const exportJSON = () => dispatch(exportData())
  const importJSON = async () => {
    const data = await importFile()
    dispatch(importData(data))
  }
  const apply = () => {
    applyWindow(current)
    dispatch(updateEditedList({ id: current.id, type, isEdited: false }))
  }
  const save = () => {
    // TODO when list.length === 0, show dialog to ask if want delete the collection/window
    dispatch(setCollectionWithLocalStorage(current))
    dispatch(updateEditedList({ id: current.id, type, isEdited: false }))
  }

  const isCurrentEdited = editedMap[current.id] ?? false

  return (
    <header className="flex h-16 w-auto flex-none bg-danube-100">
      <h2>Tabs Box</h2>
      <div className="search flex">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered max-w-xs"
        />
        <button className="btn btn-outline btn-primary p-2">search</button>
      </div>
      <LoadingBtn onClick={exportJSON}>export</LoadingBtn>
      <LoadingBtn onClick={importJSON} loadingTime={3000}>
        import
      </LoadingBtn>
      {type === "window" ? (
        <LoadingBtn
          className={`btn p-2 ${isCurrentEdited ? "btn-error animate-bounce" : "btn-outline btn-primary"}`}
          onClick={apply}
          loadingTime={1000}
          disabled={!isCurrentEdited}
        >
          apply
        </LoadingBtn>
      ) : (
        <LoadingBtn
          className={`btn p-2 ${isCurrentEdited ? "btn-error animate-bounce" : "btn-outline btn-primary"}`}
          onClick={save}
          loadingTime={1000}
          disabled={!isCurrentEdited}
        >
          save
        </LoadingBtn>
      )}
      <button
        className={`btn btn-outline btn-primary p-2`}
        onClick={() => toast.current?.show({ message: "this is a message" })}
      >
        show message
      </button>
    </header>
  )
}

export default Header
