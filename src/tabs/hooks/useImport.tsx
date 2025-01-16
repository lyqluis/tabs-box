import { useEffect, useState } from "react"
import { flushSync } from "react-dom"

import { useGlobalCtx } from "~tabs/components/context"
import { useDialog } from "~tabs/components/Dialog/DialogContext"
import { setCollections } from "~tabs/components/reducers/actions"
import { localSaveCollection } from "~tabs/store"
import { sortCollections } from "~tabs/utils/collection"
import {
  compareCollections,
  formatCollections,
  importFile
} from "~tabs/utils/data"

import useAsyncAction from "./useAsyncAction"

// import hook
const useImport = () => {
  const [isImporting, setIsImporting] = useState(false)
  // reducer state
  const {
    state: { collections },
    dispatch
  } = useGlobalCtx()
  const { openDialog, setDialog } = useDialog()
  const [importLength, setImportLength] = useState(collections.length)

  const importData = async (importJson) => {
    setIsImporting(true)
    flushSync(() => {
      // incase the next import length will not update
      setImportLength(collections.length)
    })

    // 1. import file
    // click IMPORT button
    if (!importJson) {
      console.log("🪝📁 useImport click IMPORT button", importJson)
      importJson = await importFile({
        onFileConfirmed: () => {
          openDialog({
            message: "Processing",
            content: (
              <span className="loading loading-spinner loading-lg"></span>
            )
          })
        },
        onFileCanceled: () => {
          setIsImporting(false)
        }
      })
    }

    let newCollections = importJson.collections
    // 1.1 compare data with old one
    newCollections = compareCollections(newCollections, collections)
    // 1.2 format collections
    newCollections = formatCollections(newCollections)
    // 1.3 sort collections
    newCollections = sortCollections(newCollections)
    // 2. set to reducer
    dispatch(setCollections(newCollections))
    // 3. set to localStorage
    newCollections.map((collection) => localSaveCollection(collection))
    // 4. set imported collection length
    setImportLength((preLength) =>
      Math.max(newCollections.length - preLength, 0)
    )
  }

  const { isExecuting, error, execute } = useAsyncAction(importData)

  useEffect(() => {
    console.log("🪝📁 useImport @isExecuting", isExecuting)
    if (!isExecuting && isImporting) {
      setIsImporting(false)
      setDialog({
        message: `Done! Import ${importLength} collections`,
        content: null,
        cancelText: "Ok"
      })
    }
  }, [importLength])

  return { isImporting, execute, error }
}

export default useImport
