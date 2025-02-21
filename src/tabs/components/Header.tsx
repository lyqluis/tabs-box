import ExportSvg from "react:~assets/svg/export.svg"
import ImportSvg from "react:~assets/svg/import.svg"

import useExport from "~tabs/hooks/useExport"
import useImport from "~tabs/hooks/useImport"
import { applyWindow } from "~tabs/utils/platform"

import CloudFileSync from "./CloudFileSync"
import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import Icon from "./Icon"
import LoadingBtn from "./LoadingBtn"
import {
  removeCollection,
  setCollectionWithLocalStorage,
  updateEditedList
} from "./reducers/actions"
import { Search } from "../contexts/searchContext"
import Theme from "./Theme"
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
    <header className="h-20 w-auto flex-none bg-base-300">
      <div className="flex h-full w-full items-center p-4">
        <Search />
        <LoadingBtn
          className="btn btn-ghost"
          onClick={exportData}
          loadingFlag={isExporting}
        >
          <Icon Svg={ExportSvg} />
          <span className="hidden lg:inline">Export</span>
        </LoadingBtn>
        <LoadingBtn
          className="btn btn-ghost"
          onClick={execute}
          loadingFlag={isImporting}
        >
          <Icon Svg={ImportSvg} />
          <span className="hidden lg:inline">Import</span>
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
        {/* <button
          className={`btn btn-outline btn-primary p-2`}
          onClick={() =>
            toast.current?.show({
              title: 'Login failed',
              message:
                "Error: OAuth2 request failed: Service responded with error: 'bad client id: 728943705731-ab09q4tsitrts56601klsrgfvunlfvti.apps.googleusercontent.com'"
            })
          }
        >
          show message
        </button> */}
        <Theme />
        <CloudFileSync className="ml-auto" />
      </div>
    </header>
  )
}
export default Header
