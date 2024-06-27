import { useEffect, useRef, useState } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import { compareCollections, importFile } from "~tabs/components/data"
import { useDialog } from "~tabs/components/Dialog/DialogContext"
import { setCollections } from "~tabs/components/reducers/actions"
import { localSaveCollection } from "~tabs/store"

// import hook
const useImport = () => {
  const [isImporting, setIsImporting] = useState(false)
  // reducer state
  const {
    state: { collections },
    dispatch
  } = useGlobalCtx()
  const { openDialog, setDialog } = useDialog()

  const importData = async () => {
    setIsImporting(true)
    // 1. import file
    const importCollections = await importFile({
      onFileConfirmed: () =>
        openDialog({
          message: "Processing",
          content: <span className="loading loading-spinner loading-lg"></span>
        })
    })

    // 1.1 compare data with old one
    const newCollections = compareCollections(importCollections, collections)
    // 2. set to reducer
    dispatch(setCollections(newCollections))
    // 3. set to localStorage
    newCollections.map((collection) => localSaveCollection(collection))
  }

  useEffect(() => {
    console.log("🪝📁 effect", isImporting, collections)
    if (isImporting) {
      setIsImporting(false)
      setDialog({
        message: `Import ${collections.length} collections`,
        content: null
      })
    }
  }, [collections])

  return { importData, isImporting }
}

export default useImport
