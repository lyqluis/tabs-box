import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import useImport from "~tabs/hooks/useImport"
import { generateData, getLastModifiedTime } from "~tabs/utils/data"
import {
  findOrCreateFolder,
  queryRemoteFile,
  syncFile,
  uploadFileToFolder
} from "~tabs/utils/syncData"

import { useGlobalCtx } from "./context"
import { useDialog } from "./Dialog/DialogContext"

function AuthDrive() {
  const [authToken, setAuthToken] = useStorage<any>("authToken")
  const [folderId, setFolderId] = useStorage<string>("folderId")
  const [isSyncing, setIsSyncing] = useState(false)

  const {
    state: { collections }
  } = useGlobalCtx()
  const { openDialog } = useDialog()
  const { isImporting, error, execute: importData } = useImport()

  const handleLogin = async () => {
    try {
      // { grantedScopes?: string[]; token: string }
      const authToken = await chrome.identity.getAuthToken({
        interactive: true
      })
      setAuthToken(authToken)
      console.log("Token received:", authToken)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const handleLogout = async () => {
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

  const validateToken = async (authToken) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/about?fields=user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken.token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("Token is valid:", data)
        return true
      } else {
        const errorData = await response.json()
        console.error("Token is invalid:", errorData)
        return false
      }
    } catch (error) {
      console.error("Error validating token:", error)
      return false
    }
  }

  const syncDataToDrive = async () => {
    if (!authToken) {
      console.error("No auth token found")
      return
    }

    setIsSyncing(true)

    const folderName = "tst"
    const fileName = "tabs-box.json"
    const data = generateData(collections)

    // find or create folder
    let id // folder id
    if (!folderId) {
      id = await findOrCreateFolder(authToken.token, folderName)
      setFolderId(id)
    }
    // upload file to the folder
    await uploadFileToFolder(authToken.token, folderId ?? id, fileName, data)

    setIsSyncing(false)
  }

  const syncData = async () => {
    if (!authToken) {
      console.error("No auth token found")
      return
    }

    setIsSyncing(true)

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
    await syncFile(
      authToken.token,
      folderId,
      fileName,
      importData,
      data,
      lastModifiedTime
    )

    setIsSyncing(false)
  }

  return (
    <div className="p-2">
      <h1>Google Drive Sync</h1>
      {authToken ? (
        <div className="flex flex-col items-center">
          <p>Logged in!</p>
          <button className="btn" onClick={() => validateToken(authToken)}>
            check token
          </button>
          <button
            className="btn"
            onClick={() =>
              queryRemoteFile(authToken.token, folderId, "tabs-box.json")
            }
          >
            query file
          </button>
          <button className="btn" onClick={syncData} disabled={isSyncing}>
            {isSyncing ? "Syncing..." : "Sync Data"}
          </button>
          <button className="btn" onClick={handleLogout}>
            logout
          </button>
          <button className="btn" onClick={handleLogin}>
            quick login
          </button>
        </div>
      ) : (
        <button className="btn" onClick={handleLogin}>
          Login with Google
        </button>
      )}
    </div>
  )
}

export default AuthDrive
