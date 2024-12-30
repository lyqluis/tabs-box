import useExport from "~tabs/hooks/useExport"
import useImport from "~tabs/hooks/useImport"
import { applyWindow } from "~tabs/utils/platform"

import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import LoadingBtn from "./LoadingBtn"
import {
  // exportData,
  removeCollection,
  setCollectionWithLocalStorage,
  updateEditedList
} from "./reducers/actions"
import { Search, useSearchCtx } from "./searchContext"
import { toast } from "./Toast"

const Header = () => {
  const {
    state: { editedMap },
    current,
    type,
    dispatch
  } = useGlobalCtx()
  const { openDialog } = useDialog()
  const { isImporting, execute } = useImport()
  const { isExporting, exportData } = useExport()
  const { query, handleSearch } = useSearchCtx()

  if (!current) return null

  const apply = () => {
    applyWindow(current)
    dispatch(updateEditedList({ id: current.id, type, isEdited: false }))
  }
  const save = () => {
    if (current.windows.length <= 1 && !current?.windows[0]?.tabs?.length) {
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
    <header className="flex h-16 w-auto flex-none items-center bg-danube-100 p-4">
      <Search />
      <LoadingBtn onClick={exportData} loadingFlag={isExporting}>
        export
      </LoadingBtn>
      <LoadingBtn onClick={execute} loadingFlag={isImporting}>
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
