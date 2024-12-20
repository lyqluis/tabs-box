import { generateId } from "~tabs/utils"
import { cloneWindow } from "~tabs/utils/window"

export const createCollection = (window: Window) => {
  // add new collection
  const id = generateId()
  const created = Date.now()
  // wrapper the window in a collection
  const collection: Collection = {
    id,
    created,
    updated: created,
    sourceType: "local-client",
    title: window.tabs[0]?.title ?? "", // give a default title
    windows: [window]
  }
  return collection
}

// TODO: BUG: dragging in cloned collection doesn't work well
// TODO: add collection should be auto saved locally
export const cloneCollection = (collection: Collection): Collection => {
  const id = generateId()
  const created = Date.now()
  const windows = collection.windows.map((window) => {
    return cloneWindow(window, id)
  })
  const clonedCollection: Collection = {
    ...collection,
    id,
    created,
    updated: created,
    sourceType: "local-client",
    title: collection.title + "_cloned",
    windows
  }
  return clonedCollection
}

export const updateCollection = (collection) => {
  const updated = Date.now()
  collection.updated = updated
  return collection
}

export const compareCollections = (
  collections1: Collection[], // formated collections imported
  collections2: Collection[] // collection from recuder
): Collection[] => {
  console.log("compare", collections1, collections2)
  if (!collections2?.length) return collections1

  // ?? no necessary
  collections1.sort((a, b) => a.created - b.created)
  collections2.sort((a, b) => a.created - b.created)

  const mergedCollections = collections1.concat(collections2)
  const res = mergedCollections.reduce((map, collection) => {
    const existed = map[collection.id]
    if (!existed) {
      map[collection.id] = collection
    } else if (collection.updated > existed.updated) {
      map[collection.id] = collection
    }
    // handle collection's windows' collectionId & window.tabs' windowId
    const resCollection = map[collection.id]
    resCollection.windows = resCollection.windows.map((window) => {
      window.tabs = window.tabs.map((tab) => {
        tab.windowId = window.id
        return tab
      })
      window.collectionId = collection.id
      return window
    })
    return map
  }, {})

  return Object.values(res)
}

export const formatCollections = (collections) => {
  return collections.map((collection) => {
    collection.windows = collection.windows.map((window) => {
      window.collectionId = collection.id
      // ?? no need
      // window.tabs = window.links
      // window.tabs = window.tabs.map((tab) => {
      //   tab.windowId = window.id
      // })
      return window
    })
    return collection
  })
}

// generate export data
export const generateData = (collections: Collection[]) => {
  // get browser client info
  const ua = navigator.userAgent
  const language = navigator.language
  const created = Date.now()
  const exportCollections = collections.map((c) => {
    c.sourceType = "transfer"
    return c
  })
  const json = {
    exportId: generateId(),
    created,
    source: {
      language,
      ua
    },
    collections: exportCollections
    // format: "nxs.json.v2",
    // scope: "all",
  }
  return json
}

const formatJSON = (data): Collection[] => {
  const collections = data.collections
  if (!collections || !collections.length) return
  // iterate collections to formate and store local
  const newCollections = collections.map((collection) => {
    if (!collection.id) collection.id = generateId()
    collection.sourceType = "transfer"
    // collection.folders => colltion.windows
    collection.windows = collection.folders.map((window) => {
      // window.links => window.tabs
      // add window.tabs.windowId
      window.tabs = window.links.map((link) => {
        link.windowId = window.id
        return link
      })
      delete window.links
      return window
    })
    delete collection.folders
    return collection
  })

  return newCollections
}

export const exportFile = (data, ext = "json") => {
  let link = document.createElement("a")
  const now = Date.now()
  link.download = `tab-box-config-${now}.${ext}`
  // use Blob since data:text/plain is limited to 2kb
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
  link.href = window.URL.createObjectURL(blob)
  link.click()
}

type importFileProps = {
  // add some callback
  onFileConfirmed?: () => void
}
export const importFile = ({ onFileConfirmed }): Promise<Collection[]> => {
  return new Promise((resolve, reject) => {
    // create a file input
    let input = document.createElement("input")
    input.type = "file"

    // bind change event
    input.addEventListener("change", (event) => {
      console.log("📁 on file confirmed")
      onFileConfirmed && onFileConfirmed()
      const files = event.target.files
      if (!files || !files.length) {
        input = null
        throw new Error("No files")
      }

      // use FileReader API read the data
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          let data = JSON.parse(event.target.result)
          console.log("import data:", data)
          // formate parse data
          const formatedData = formatJSON(data)
          console.log("📁 resolve file data")
          resolve(formatedData)
        } catch (e) {
          reject(e)
          throw new Error(e)
        }
        input = null
      }
      reader.readAsText(files[0])
    })

    // upload file
    input.click()
  })
}
