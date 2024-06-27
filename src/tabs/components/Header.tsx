import { useEffect, useRef, useState } from "react"

import useImport from "~tabs/hooks/useImport"
import { applyWindow } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import { importFile } from "./data"
import { useDialog } from "./Dialog/DialogContext"
import LoadingBtn from "./LoadingBtn"
import {
  exportData,
  importData,
  removeCollection,
  setCollectionWithLocalStorage,
  updateEditedList
} from "./reducers/actions"
import { toast } from "./Toast"

const Header = () => {
  const {
    state: { current, editedMap },
    dispatch
  } = useGlobalCtx()
  const { openDialog, setDialog } = useDialog()
  const { importData, isImporting } = useImport()

  // const [flag, setFlag] = useState(false)
  // useEffect(() => {
  //   console.log("useEffect, flag", flag)
  //   if (flag) {
  //     setDialog({ content: <span>asdfasdga</span> })
  //   }
  // }, [flag])

  if (!current) return null

  const type = current?.created ? "collection" : "window"
  const exportJSON = () => dispatch(exportData())

  // const importJSON = async () => {
  //   const data = await importFile({
  //     onFileConfirmed: () => {
  //       openDialog({
  //         message: "processing",
  //         content: <span className="loading loading-spinner loading-lg"></span>
  //       })
  //     }
  //   })
  //   dispatch(importData(data))
  // }

  const apply = () => {
    applyWindow(current)
    dispatch(updateEditedList({ id: current.id, type, isEdited: false }))
  }
  const save = () => {
    if (current.windows.length === 1 && !current.windows[0].tabs.length) {
      openDialog({
        title: "Warn",
        message: `collection ${current.title} will be permanently deleted`,
        onConfirm: () => {
          dispatch(removeCollection(current))
          dispatch(updateEditedList({ id: current.id, type, isEdited: false }))
        }
      })
    } else {
      dispatch(setCollectionWithLocalStorage(current))
      dispatch(updateEditedList({ id: current.id, type, isEdited: false }))
    }
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
      <LoadingBtn onClick={importData} loadingFlag={isImporting}>
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
