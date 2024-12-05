import { useEffect, useState } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  compareCollections,
  formatCollections,
  importFile
} from "~tabs/components/data"
import { useDialog } from "~tabs/components/Dialog/DialogContext"
import { setCollections } from "~tabs/components/reducers/actions"
import { localSaveCollection } from "~tabs/store"

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
  const [oldLength, setOldLength] = useState(collections.length)

  const importData = async () => {
    setIsImporting(true)
    setOldLength(collections.length)
    // 1. import file
    const importCollections = await importFile({
      onFileConfirmed: () =>
        openDialog({
          message: "Processing",
          content: <span className="loading loading-spinner loading-lg"></span>
        })
    })

    // 1.1 compare data with old one
    let newCollections = compareCollections(importCollections, collections)
    // 1.2 format collections
    newCollections = formatCollections(newCollections)
    // 2. set to reducer
    dispatch(setCollections(newCollections))
    // 3. set to localStorage
    newCollections.map((collection) => localSaveCollection(collection))
  }

  const { isExecuting, error, execute } = useAsyncAction(importData)

  useEffect(() => {
    console.log("🪝📁 useImport @isExecuting", isExecuting)
    if (!isExecuting) {
      setIsImporting(false)
      // import data setted
      setDialog({
        message: `Import ${collections.length - oldLength} collections`,
        content: null,
        cancelText: "Ok"
      })
    }
  }, [isExecuting])

  return { isImporting, execute, error }
}

export default useImport
