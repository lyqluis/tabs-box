import { localSaveCollection } from "~tabs/store"
import {
  compareCollections,
  formatCollections,
  importFile
} from "~tabs/utils/data"

export const importData = async () => {
  // 1. import file
  const importCollections = await importFile({
    onFileConfirmed: () => {}
    // openDialog({
    //   message: "Processing",
    //   content: <span className="loading loading-spinner loading-lg"></span>
    // })
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
