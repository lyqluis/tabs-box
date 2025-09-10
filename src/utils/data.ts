import { generateId } from "."
import { hashCollection, hashWindow } from "./hash"
import { cloneWindow, normalizeWindow } from "./window"

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

// TODO: init exportData base data
export const baseExportData = {
  modified: 0 // record deleted collection timestamp
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
    modified: baseExportData.modified ?? getLastModifiedTime(collections),
    source: {
      language,
      ua
    },
    collections: removeCircularReferences(exportCollections)
  }
  console.log("generateData", json)

  return json
}

// NOTE: 循环引用 related
// add window.collection, tab.window, is in the normalizeData function
// placeholder window.collectoin, tab.window
export const removeCircularReferences = (collections: Collection[]): any => {
  const temp = "[Circular]"

  return collections.map((collection) => ({
    ...collection,
    windows: collection.windows.map((window) => ({
      ...window,
      collection: window.collection ? temp : undefined,
      tabs: window.tabs.map((tab) => ({
        ...tab,
        window: tab.window ? temp : undefined
      }))
    }))
  }))
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

// NOTE: 只作增量处理
export const compareCollectionsByTitle = async (
  collections1: Collection[], // normalized session-buddy collections imported
  collections2: Collection[] // collection from recuder
): Promise<Collection[]> => {
  console.log("compare collections by title", collections1, collections2)
  if (!collections1?.length) return collections2
  if (!collections2?.length) return collections1

  // 1. 处理所有有定义的title
  // 创建映射：title -> collection
  const createTitleMap = async (collections) => {
    const map = new Map()
    for (const col of collections) {
      const title = col.title
      // 忽略undefined和空字符串title
      if (!title) continue
      const hash = await hashCollection(col) // col.hash is set
      // console.log("hash generated", hash)
      map.set(title, col)
    }
    return map
  }

  const mapA = await createTitleMap(collections1)
  const mapB = await createTitleMap(collections2)

  // 最终合并结果
  const mergedCollections: Collection[] = []

  const allTitles = new Set([...mapA.keys(), ...mapB.keys()])

  for (const title of allTitles) {
    const hasA = mapA.has(title)
    const hasB = mapB.has(title)

    if (hasA && hasB) {
      const colA = mapA.get(title)
      const colB = mapA.get(title)
      const hashA = colA.hash
      const hashB = colB.hash

      if (hashA === hashB) {
        // 哈希相同，保留任意一个
        mergedCollections.push(colB)
      } else {
        // 哈希不同，需要深度比较窗口
        const resolvedCollection = await resolveCollectionConflict(colA, colB)
        mergedCollections.push(resolvedCollection)
      }
    } else if (hasA) {
      // 只在A中存在
      mergedCollections.push(mapA.get(title))
    } else if (hasB) {
      // 只在B中存在
      mergedCollections.push(mapB.get(title))
    }
  }

  // 2. 处理无title的集合（title为''或undefined或null）
  // 增量处理，全部保留，用户自己在本地删减
  const filterUntitled = (collections) => {
    return collections.filter((col) => !col.title)
  }

  const untitledA = filterUntitled(collections1)
  const untitledB = filterUntitled(collections2)

  // hash -> collection
  const hashMap = new Map()

  const addToHashMap = async (collections) => {
    for (const col of collections) {
      const hash = await hashCollection(col)
      hashMap.set(hash, col)
    }
  }

  await Promise.all([addToHashMap(untitledA), addToHashMap(untitledB)])

  // 添加所有唯一的无title集合
  for (const col of hashMap.values()) {
    mergedCollections.push(col)
  }
  console.log("compare finished", mergedCollections)
  return mergedCollections
}

// 用于通过title来匹配对比collection hash的冲突处理
// 对于冲突collection，其windows只做增量处理
async function resolveCollectionConflict(
  collectionA,
  collectionB
): Promise<Collection> {
  const mergedWindows = []
  // hash -> window
  const hashMap = new Map()
  const addWindowToHashMap = async (windows) => {
    for (const window of windows) {
      if (!window.hash) {
        await hashWindow(window)
      }
      const hash = window.hash
      hashMap.set(hash, window)
    }
  }
  await Promise.all([
    addWindowToHashMap(collectionA.windows),
    addWindowToHashMap(collectionB.windows)
  ])

  // 返回colB（本地），windows增量处理
  for (const window of hashMap.values()) {
    const normalizedWindow = normalizeWindow(window, collectionB)
    mergedWindows.push(normalizedWindow)
  }
  collectionB.windows = mergedWindows
  return collectionB
}

export const compareCollectionsById = (
  collections1: Collection[], // normalized collections imported
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

export const compareCollections = async (
  collections1: Collection[], // normalized collections imported
  collections2: Collection[], // collection from recuder
  mode: "id" | "title" // id | title
) => {
  if (mode === "id") {
    return compareCollectionsById(collections1, collections2)
  } else {
    return compareCollectionsByTitle(collections1, collections2)
  }
}

// NOTE: normalize data, compatible with data from session-buddy
// new session-buddy data (created by export) has no longer `id` in collection/window/link,
// and has no longer `created` or `updated` in collection,
// only has collections array within a object in JSON
// but data created by backup is normal with `id`, `created`, props...
export const normalizeData = (data: any): any => {
  // add `modified` via `created`
  if (!data.modified) {
    const created = data.created ?? Date.now()
    data.modified = new Date(created).getTime()
  }
  const isSessionBuddy = data?.fileName
    ?.toLowerCase()
    ?.includes("session-buddy") // 'session-buddy-export' | 'session-buddy-backup'
  // normalize collections
  const collections = data.collections
  if (!collections || !collections.length) return
  const newCollections = collections.map((collection) => {
    const rawId = collection.id
    if (isSessionBuddy) {
      collection.rawId = rawId
      collection.id = generateId()
    }
    collection.id = rawId ?? generateId()
    collection.sourceType = isSessionBuddy ? "session-buddy" : "transfer"
    collection.created = collection.created ?? data.modified
    collection.updated = collection.updated ?? collection.created

    // collection.folders => colltion.windows
    const windows = collection.folders ?? collection.windows
    collection.windows = windows.map((window) => {
      window.id = window.id ?? generateId()
      // window.links => window.tabs
      // add window.tabs.windowId
      const tabs = window.links ?? window.tabs
      window.tabs = tabs.map((link) => {
        link.id = link.id ?? generateId()
        // add window to link
        link.windowId = window.id
        link.window = window
        return link
      })
      delete window.links

      // add collection to window
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
      const file = files[0]
      const fileName = file.name

      // use FileReader API read the data
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          let data = JSON.parse(event.target.result)
          console.log("import data:", data)
          // normalize data
          const normalizedData = normalizeData(data)
          console.log("📁 resolve file data")
          // add file name to identify is data from session-buddy
          normalizeData.fileName = fileName
          resolve(normalizedData)
        } catch (e) {
          reject(e)
          throw new Error(e)
        }
        input = null
      }
      reader.readAsText(file)
    })

    input.addEventListener("cancel", (event) => {
      console.log("📁 on file canceled")
      onFileCanceled && onFileCanceled()
    })

    // upload file
    input.click()
  })
}
