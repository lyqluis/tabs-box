import { useEffect, useState } from "react"
import CloudSvg from "react:~assets/svg/cloud.svg"
import DriveSvg from "react:~assets/svg/drive.svg"
import LogoutSvg from "react:~assets/svg/logout.svg"

import { useStorage } from "@plasmohq/storage/hook"

import useAsyncAction from "~tabs/hooks/useAsyncAction"
import useImport from "~tabs/hooks/useImport"
import { validateToken, type AuthToken } from "~tabs/utils/auth"
import { generateData, getLastModifiedTime } from "~tabs/utils/data"
import { findOrCreateFolder, syncFile } from "~tabs/utils/syncData"

import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"
import LoadingBtn from "./LoadingBtn"
import { toast } from "./Toast"

const CloudFileSync = ({ className }) => {
  const [authToken, setAuthToken] = useStorage<any>("authToken")
  const [folderId, setFolderId] = useStorage<string>("folderId")
  const [isSyncing, setIsSyncing] = useState(false)

  const {
    state: { collections }
  } = useGlobalCtx()
  const { openDialog, setDialog } = useDialog()
  const { error: importError, execute: importData } = useImport()

  const login = async (): Promise<AuthToken> => {
    try {
      const authToken = await chrome.identity.getAuthToken({
        interactive: true
      })
      console.log("Token received:", authToken)
      setAuthToken(authToken)
      return authToken
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const logout = async () => {
    try {
      // 移除缓存的 Token
      chrome.identity.removeCachedAuthToken({ token: authToken.token }, () => {
        if (chrome.runtime.lastError) {
          console.error("Failed to remove token:", chrome.runtime.lastError)
          return
        }
        setAuthToken(null)
        console.log("Token removed successfully")
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const { execute: handleLogin, isExecuting: isLoginProcessing } =
    useAsyncAction(login)
  const { execute: handleLogout, isExecuting: isLogoutProcessing } =
    useAsyncAction(logout)

  const syncData = async () => {
    let token
    if (!authToken) {
      console.error("No auth token found")
      console.log("Refresh token")
      token = await handleLogin()
    }
    const isTokenValid = await validateToken(authToken ?? token)
    if (!isTokenValid) {
      token = await handleLogin()
    }

    setIsSyncing(true)
    openDialog({
      message: "Processing",
      content: <span className="loading loading-spinner loading-lg"></span>
    })

    const folderName = "tst"
    const fileName = "tabs-box.json"
    const data = generateData(collections)
    const lastModifiedTime = getLastModifiedTime(collections)

    // find or create folder
    let id // folder id
    if (!folderId) {
      id = await findOrCreateFolder(authToken.token, folderName)
      setFolderId(id)
    }

    // sync file to the folder
    const closeDialogContent = await syncFile(
      authToken.token,
      folderId,
      fileName,
      importData,
      data,
      lastModifiedTime
    )

    if (closeDialogContent) {
      setDialog({
        message: "Done!",
        content: closeDialogContent,
        cancelText: "Ok"
      })
    }
    setIsSyncing(false)
  }

  useEffect(() => {
    if (importError) {
      console.error("Import error:", importError)
      toast.current?.show({ message: importError, title: "Error" })
    }
  }, [importError])

  return (
    <div
      className={
        "flex items-center gap-1 p-2" +
        " relative pl-4 before:absolute before:bottom-3 before:left-0 before:top-3 before:w-px before:bg-gray-300 before:content-['']" +
        (className ? ` ${className}` : "")
      }
    >
      {/* Login button */}
      <LoadingBtn
        className={
          "btn btn-circle mr-2 min-h-4 min-w-4" +
          (authToken
            ? " h-10 w-10 ring ring-primary ring-offset-2 ring-offset-base-100"
            : "")
        }
        loadingFlag={isLoginProcessing}
        onClick={handleLogin}
      >
        <DriveSvg
          className={
            "h-full w-full" + (authToken ? " fill-slate-700" : " fill-gray-400")
          }
        />
      </LoadingBtn>

      {authToken ? (
        <>
          <LoadingBtn
            className="btn btn-ghost"
            onClick={syncData}
            disabled={isSyncing}
            loadingFlag={isSyncing}
          >
            <CloudSvg className="h-5 w-5 fill-slate-700" />
            <span className="hidden lg:inline">Sync Data</span>
          </LoadingBtn>
          <LoadingBtn
            className="btn btn-ghost"
            onClick={handleLogout}
            loadingFlag={isLogoutProcessing}
          >
            <LogoutSvg className="h-5 w-5 fill-slate-700" />
            <span className="hidden lg:inline">Log out</span>
          </LoadingBtn>
        </>
      ) : null}
    </div>
  )
}

export default CloudFileSync
