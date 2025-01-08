import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

function AuthDrive() {
  const [authToken, setAuthToken] = useStorage<any>("authToken")
  const [isSyncing, setIsSyncing] = useState(false)

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
        setAuthToken(null)
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
    try {
      const data = "Your data to sync"
      const fileMetadata = {
        name: "data.txt",
        parents: ["YOUR_FOLDER_ID"]
      }
      const form = new FormData()
      form.append(
        "metadata",
        new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
      )
      form.append("file", new Blob([data], { type: "text/plain" }))

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: new Headers({ Authorization: "Bearer " + authToken.token }),
          body: form
        }
      )
      const result = await response.json()
      console.log("File uploaded:", result)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsSyncing(false)
    }
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
            onClick={syncDataToDrive}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : "Sync Data"}
          </button>
          <button className="btn" onClick={() => setAuthToken(null)}>
            logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  )
}

export default AuthDrive
