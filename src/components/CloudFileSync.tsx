import CloudSvg from "@/assets/svg/cloud.svg?react"
import DriveSvg from "@/assets/svg/drive.svg?react"
import LogoutSvg from "@/assets/svg/logout.svg?react"
import useAsyncAction from "@/hooks/useAsyncAction"
import useModal from "@/hooks/useModal"
import { useStorageState } from "@/hooks/useStorageState"
import { localSaveCollection } from "@/store"
import { validateToken, type AuthToken } from "@/utils/auth"
import { sortCollections } from "@/utils/collection"
import { baseExportData, getLastModifiedTime } from "@/utils/data"
import { findOrCreateFolder, syncFile } from "@/utils/syncData"
import { useRef, useState } from "react"

import { useGlobalCtx } from "./contexts/context"
import Icon from "./Icon"
import LoadingBtn from "./LoadingBtn"
import { setCollections } from "./data/actions"
import { toast } from "./Toast"

const CloudFileSync = ({ className = "" }) => {
  const [authToken, setAuthToken] = useStorageState<any>(
    "authToken",
    null,
    "sync"
  )
  const [folderId, setFolderId] = useStorageState<string>(
    "folderId",
    "",
    "sync"
  )
  const [isSyncing, setIsSyncing] = useState(false)

  const {
    state: { collections },
    dispatch
  } = useGlobalCtx()
  const { modal } = useModal()
  const modalInstance = useRef(null)

  const login = async (): Promise<AuthToken> => {
    try {
      console.log("await chrome identity Token")
      const authToken = await chrome.identity.getAuthToken({
        interactive: true
      })
      // console.log("Token received:", authToken)
      setAuthToken(authToken)
      toast.current?.show({
        type: "success",
        title: "Login success",
        message: "You have successfully logged in"
      })
    } catch (error: any) {
      toast.current?.show({
        type: "error",
        title: "Login failed",
        message: error.toString()
      })
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
        toast.current?.show({
          type: "success",
          title: "Logout success",
          message: "You have successfully logged out"
        })
      })
    } catch (error) {
      console.error("Logout failed:", authToken, error)
    }
  }

  const { execute: handleLogin, isExecuting: isLoginProcessing } =
    useAsyncAction(login)
  const { execute: handleLogout, isExecuting: isLogoutProcessing } =
    useAsyncAction(logout)

  const syncData = async () => {
    let token = authToken
    try {
      console.log("☁️ start sync")

      setIsSyncing(true)
      modalInstance.current = modal.open({
        message: "Processing",
        content: <span className="loading loading-spinner loading-lg"></span>
      })

      // 1. auth
      if (!authToken) {
        console.warn("🔑 No auth token found, refresh token")
        token = await handleLogin()
      }
      const isTokenValid = await validateToken(authToken ?? token)
      if (!isTokenValid) {
        // FIX: can not get latest token in the sync logic
        console.warn("🔑 Auth token is invalid, refresh token")
        token = await handleLogin()
      }

      // 2. generate local data file
      const folderName = "tabs-box"
      const fileName = "tabs-box.json"
      const lastModifiedTime = Math.max(
        getLastModifiedTime(collections),
        baseExportData.modified
      )

      // 3. find or create cloud folder
      let id // folder id
      if (!folderId) {
        id = await findOrCreateFolder(token.token, folderName)
        setFolderId(id)
      }

      // 4. sync file to the folder
      console.log("☁️ sync file", token)
      modalInstance.current?.update({
        message: "Sync files..."
      })

      const { merged, conflicts, syncResultMessage } = await syncFile(
        token.token, // in case authToken not updated yet
        folderId,
        fileName,
        collections, // local collections
        lastModifiedTime
      )

      // generate import data function alone only for sync data process
      // 1.3 sort collections
      let newCollections = sortCollections(merged)
      // 2. set to reducer
      dispatch(setCollections(newCollections))
      // 3. set to localStorage
      newCollections.map((collection) => localSaveCollection(collection))
      // 4. set imported collection length
      // TODO: merge result such as {add: 4, delete: 2, changed: 4}
      modalInstance.current?.update({
        message: "Done!",
        content: syncResultMessage,
        cancelText: "Ok"
      })
    } catch (error) {
      toast.current?.show({ message: error + "", title: "Error" })
      modalInstance.current?.update({
        title: "Something went wrong, please try again",
        message: error + "",
        // TODO: add a Error render component to display error detail
        content: null,
        cancelText: "Ok"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div
      className={
        "flex items-center p-2 sm:pr-0" +
        " relative pl-4 before:absolute before:top-3 before:bottom-3 before:left-0 before:mx-1 before:w-px before:bg-gray-300 before:content-['']" +
        (className ? ` ${className}` : "")
      }
    >
      <LoadingBtn
        className={
          "btn btn-circle mr-1" + (authToken ? " ring-primary ring" : "")
        }
        loading={isLoginProcessing}
        onClick={handleLogin}
      >
        <Icon
          Svg={DriveSvg}
          className={"h-auto w-8" + (authToken ? "" : " fill-gray-400")}
        />
      </LoadingBtn>
      {authToken ? (
        <>
          <LoadingBtn
            className="btn btn-ghost"
            onClick={syncData}
            disabled={isSyncing}
            loading={isSyncing}
          >
            <Icon Svg={CloudSvg} />
            <span className="hidden lg:inline">Sync Data</span>
          </LoadingBtn>
          <LoadingBtn
            className="btn btn-ghost"
            onClick={handleLogout}
            loading={isLogoutProcessing}
          >
            <Icon Svg={LogoutSvg} />
            <span className="hidden lg:inline">Log out</span>
          </LoadingBtn>
        </>
      ) : null}
    </div>
  )
}

export default CloudFileSync
