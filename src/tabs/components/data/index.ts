import { generateId } from "~tabs/utils"

export const createCollection = (window: chrome.windows.Window) => {
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

export const updateCollection = (collection) => {
  const updated = Date.now()
  collection.updated = updated
  return collection
}

export const compareCollections = (
  collections1: Collection[], // formated
  collections2: Collection[]
) => {
  console.log("compare", collections1, collections2)

  collections1.sort((a, b) => a.created - b.created)
  collections2.sort((a, b) => a.created - b.created)

  const mergedCollections = collections1.concat(collections2)
  const res = mergedCollections.reduce((acc, current) => {
    const existed = acc[current.id]
    if (!existed) {
      acc[current.id] = current
    } else if (current.updated > existed.updated) {
      acc[current.id] = current
    }
    return acc
  }, {})

  return Object.values(res)
}

// generate export data
export const generateData = (collections: Collection[]) => {
  // get browser client info
  const ua = navigator.userAgent
  const language = navigator.language
  const created = Date.now()
  const exportCollections = collections.map((c) => (c.sourceType = "transfer"))
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
      window.tabs = window.links
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

export const importFile = () => {
  return new Promise((resolve, reject) => {
    // create a file input
    let input = document.createElement("input")
    input.type = "file"

    // bind change event
    input.addEventListener("change", (event) => {
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
