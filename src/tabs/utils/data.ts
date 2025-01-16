import { generateId } from "."
import { cloneWindow } from "./window"

interface ExportData {
  exportId: string
  created: number
  modified: number // last modified collection time
  source: {
    language: string
    ua: string
  }
  collections: Collection[]
  // format: "nxs.json.v2",
  // scope: "all",
}

export const generateData = (collections: Collection[]): Object => {
  // get browser client info
  const ua = navigator.userAgent
  const language = navigator.language
  const created = Date.now()
  const exportCollections = collections.map((c) => {
    c.sourceType = "transfer"
    return c
  })
  const json: ExportData = {
    exportId: generateId(),
    created,
    modified: getLastModifiedTime(collections),
    source: {
      language,
      ua
    },
    collections: removeCircularReferences(exportCollections)
  }
  console.log("generateData", json)

  return json
}

// tab.window, window.collection
// TODO: 增加循环引用

// 移除循环引用
export const removeCircularReferences = (
  obj: any,
  seen: WeakSet<any> = new WeakSet()
): any => {
  // return directly
  if (obj === null || typeof obj !== "object") return obj

  // obj is visited, return a circular reference
  if (seen.has(obj)) return "[Circular]"

  // record current obj
  seen.add(obj)

  // handle array
  if (Array.isArray(obj)) {
    return obj.map((item) => removeCircularReferences(item, seen))
  }

  // handle plain objects
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = removeCircularReferences(obj[key], seen)
    }
  }

  return result
}

export const generateExportBlob = (data, ext = "json") => {
  const now = Date.now()
  const fileName = `tabs-box-config-${now}.${ext}`
  // use Blob since data:text/plain is limited to 2kb
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
  return { fileName, blob }
}

export const getLastModifiedTime = (collections: Collection[]): number =>
  Math.max(...collections.map((c) => c.updated))

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
  collection.windows.map((window) => {
    window.collectionId = id
    window.collection = collection
  })
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
  clonedCollection.windows.map((window) => {
    window.collectionId = id
    window.collection = clonedCollection
  })
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
    if (!existed || collection.updated > existed.updated) {
      map[collection.id] = collection
    }
    // handle collection's window.collectionId & window.tab.windowId|collectionId
    const resCollection = map[collection.id]
    resCollection.windows = resCollection.windows.map((window) => {
      window.tabs = window.tabs.map((tab) => {
        tab.windowId = window.id
        tab.window = window
        // console.log("🔗 compare - tab", tab)
        return tab
      })
      window.collectionId = collection.id
      window.collection = resCollection
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

// normalize data from session-buddy(in case)
export const formatJSON = (data): any => {
  // add `modified` via `created`
  if (!data.modified) {
    const created = data.created
    data.modified = new Date(created).getTime()
  }
  // normalize collections
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
        link.window = window
        return link
      })
      delete window.links

      window.collectionId = collection.id
      window.collection = collection
      return window
    })
    delete collection.folders
    return collection
  })

  data.collections = newCollections
  return data
}

// TODO: enhance download file via fetch & Response.body/Range
export const exportFile = (data): void => {
  const { fileName, blob } = generateExportBlob(data)

  let link = document.createElement("a")
  link.download = fileName
  link.href = window.URL.createObjectURL(blob)
  link.click()

  // Clean up the object URL
  window.URL.revokeObjectURL(link.href)
}

export const importFile = ({
  onFileConfirmed,
  onFileCanceled
}): Promise<Collection[]> => {
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

    input.addEventListener("cancel", (event) => {
      console.log("📁 on file canceled")
      onFileCanceled && onFileCanceled()
    })

    // upload file
    input.click()
  })
}

export const normalizeData = (data: any) => {}
