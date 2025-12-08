import { readonly, shallowReactive } from "vue"
import type {
  Collection,
  TaskCollection,
  TaskTab,
  TaskWindow,
  WrappedCollection,
  WrappedTab,
  WrappedWindow,
} from "../types/data"
import { hashCollection } from "./hash"

export const formatData = (file: any) => {
  console.log("file content: ", file)
  const { collections } = file

  const res: TaskCollection[] = collections.map((col: any) => {
    const windows = col.folders ?? col.windows
    col.windows = windows.map((w: any) => {
      const tabs = w.links ?? w.tabs
      w.tabs = tabs.map((t: any) => {
        return { raw: t, extra: {} }
      })
      if (w.links) delete w.links
      return { raw: w, extra: {} }
    })
    if (col.folders) delete col.folders
    return { raw: col, extra: {} }
  })

  return sortCollection(res)
}

const sortCollection = (collections: TaskCollection[]) => {
  return collections.sort((a, b) => a.raw.created - b.raw.created)
}

/**
 * Enhanced comparison function that properly handles collections with duplicate titles
 * @param collections1 - First set of collections to compare
 * @param collections2 - Second set of collections to compare
 * @returns Merged collection array with all collections preserved
 */
export const compareCollectionsByTitleImproved = async (
  collections1: TaskCollection[],
  collections2: TaskCollection[],
): Promise<{
  sames: TaskCollection[]
  conflictsA: TaskCollection[]
  conflictsB: TaskCollection[]
}> => {
  if (!collections1?.length)
    return { sames: [], conflictsA: [], conflictsB: collections2 }
  if (!collections2?.length)
    return { sames: [], conflictsA: collections1, conflictsB: [] }

  // 1. Process collections with defined titles - create enhanced mapping
  const createEnhancedTitleMap = async (collections: TaskCollection[]) => {
    const map = new Map<string, TaskCollection[]>()

    for (const col of collections) {
      const title = col.raw.title
      // Ignore undefined and empty string titles
      if (!title) continue

      // * Use title as key but store arrays to handle duplicates
      if (!map.has(title)) {
        map.set(title, [])
      }
      const hash = await hashCollection(col) // col.hash is set
      map.get(title)!.push(col)
    }
    return map
  }

  const mapA = await createEnhancedTitleMap(collections1)
  const mapB = await createEnhancedTitleMap(collections2)

  const sames = []
  const conflictsA = []
  const conflictsB = []

  // Get all unique titles from both collections
  const allTitles = new Set([...mapA.keys(), ...mapB.keys()])

  // BUG: 也可能存在名字不一样，但是hash一样的情况
  for (const title of allTitles) {
    const hasA = mapA.has(title)
    const hasB = mapB.has(title)

    if (hasA && hasB) {
      // Multiple collections with same title in both sets
      const colsA = mapA.get(title)!
      const colsB = mapB.get(title)!

      // Handle multiple collections with same title
      // For each collection in A, check if it exists in B
      for (const colA of colsA) {
        let foundMatch = false

        for (const colB of colsB) {
          // Compare by hash
          const hashA = colA.extra.hash
          const hashB = colB.extra.hash

          if (hashA === hashB) {
            // Hashes match, keep one (prefer B as it's from local storage)
            sames.push(colB)
            foundMatch = true
            break
          }
        }

        // If no match found, add collection A (it's from imported data)
        if (!foundMatch) {
          conflictsA.push(colA)
        }
      }

      // Add collections from B that weren't matched with A
      for (const colB of colsB) {
        const existsInResult = sames.some((c) => c.raw.id === colB.raw.id)
        if (!existsInResult) {
          conflictsB.push(colB)
        }
      }
    } else if (hasA) {
      // Only in A - add all collections with this title
      const colsA = mapA.get(title)!
      conflictsA.push(...colsA)
    } else if (hasB) {
      // Only in B - add all collections with this title
      const colsB = mapB.get(title)!
      conflictsB.push(...colsB)
    }
  }

  // TODO:
  // 2. Handle collections without titles (empty string, undefined, null)
  // Incremental processing, all kept, user can delete manually
  const filterUntitled = (collections: TaskCollection[]) => {
    return collections.filter((col) => !col.raw.title)
  }

  const untitledA = filterUntitled(collections1)
  const untitledB = filterUntitled(collections2)

  // Hash -> collection for untitled collections
  // const hashMapA = new Map<string, any>()
  const hashMapB = new Map<string, TaskCollection>()

  const generateHash = async (collections: TaskCollection[]) => {
    for (const col of collections) {
      const hash = await hashCollection(col)
    }
  }
  const addToHashMap = async (
    collections: TaskCollection[],
    hashMap: Map<string, TaskCollection>,
  ) => {
    for (const col of collections) {
      const hash = await hashCollection(col)
      hashMap.set(hash as string, col)
    }
  }

  await Promise.all([
    generateHash(untitledA),
    // addToHashMap(untitledA, hashMapA),
    addToHashMap(untitledB, hashMapB),
  ])

  // compare untitiled by hash
  for (const colA of untitledA) {
    const hash = colA.extra.hash ?? ""
    if (hashMapB.has(hash)) {
      sames.push(colA)
      hashMapB.delete(hash)
    } else {
      conflictsA.push(colA)
    }
  }

  // Add all unique untitled collections
  for (const col of hashMapB.values()) {
    conflictsB.push(col)
  }

  tagConfictCollections(conflictsA, conflictsB)

  return { sames, conflictsA, conflictsB }
}

// tag conflict collections between A and B
// find out those with the same name or id but not undefined
const tagConfictCollections = (
  collectionsA: TaskCollection[],
  collectionsB: TaskCollection[],
) => {
  for (const colA of collectionsA) {
    const titleA = colA.raw.title
    const idA = colA.raw.id
    const hashA = colA.extra.hash
    const colB = collectionsB.find(
      (c) =>
        c.raw.id === idA ||
        (titleA && c.raw.title === titleA) ||
        c.extra.hash === hashA,
    )
    if (colA && colB) {
      colA.extra.conflict = colB.raw.id
      colB.extra.conflict = colA.raw.id
    }
  }
}

/* -------------------- shallowReactive ------------------------*/
const wrapTab = (tab: TaskTab) =>
  shallowReactive({
    data: readonly(tab.raw),
    checked: false,
    ...tab.extra,
    window: null as any,
    windowId: null as any,
  })

const wrapWindow = (window: TaskWindow) => {
  const tabs = window.raw.tabs.map(wrapTab)
  const win = shallowReactive({
    data: readonly({ ...window.raw, tabs: tabs.map((t) => t.data) }),
    tabs,
    checked: false,
    ...window.extra,
    collection: null as any,
    collectionId: null as any,
  })
  tabs.map((t) => {
    t.window = win
    t.windowId = win.data.id
  })
  return win
}

export const wrapCollection = (col: TaskCollection) => {
  const windows = col.raw.windows.map(wrapWindow)
  const collection = shallowReactive({
    data: readonly({ ...col.raw, windows: windows.map((w) => w.data) }),
    windows,
    checked: false,
    ...col.extra,
  })
  windows.map((w) => {
    w.collection = collection
    w.collectionId = collection.data.id
  })
  return collection
}
/* -------------------- shallowReactive end ------------------------*/

export const cloneWrappedTab = (tab: WrappedTab) => {
  return shallowReactive({
    ...tab,
  })
}
export const cloneWrappedWindow = (w: WrappedWindow) => {
  const tabs = w.tabs.map(cloneWrappedTab)
  const win = shallowReactive({
    ...w,
    tabs,
  })
  tabs.map((t) => {
    t.window = win
  })
  return win
}
export const cloneWrappedCollection = (col: WrappedCollection) => {
  const windows = col.windows.map(cloneWrappedWindow)
  const collection = shallowReactive({
    ...col,
    windows,
    transferred: false,
  })
  windows.map((w) => {
    w.collection = collection
  })
  return collection
}

export const isCollectionChecked = (item) => {
  if (item.windows) {
    return item.checked
  }
  return false
}

// TODO: handle transfer
// 1. if traget is window, transfer all checked tabs to target
// 2. if target is collection,
// 2.1 if from is window, ?
// 2.2 if from is tas, ?
// 3. from is collection, how to transfer to the list
// TODO:
export const getAllCheckedItems = (
  type: "tab" | "window" | "collection",
  item,
  includeIndeterminate: boolean = true,
) => {
  // debugger
  if (type === "tab") {
    if (item.tabs) return item.tabs.filter((t) => t.checked)
    if (item.windows)
      return item.windows.reduce((acc, w) => {
        acc.push(...w.tabs.filter((t) => t.checked))
        return acc
      }, [])
    return item.checked ? [item] : null
  }
  if (type === "window") {
    if (item.tabs) return item.checked ? [item] : null
    const windowFilter = includeIndeterminate
      ? (w) => w.checked || w.indeterminate
      : (w) => w.checked

    if (item.windows) return item.windows.filter(windowFilter)
    return item.window.checked ? [item.window] : null
  }
}

// TODO:
// tag in compare that window should be tagged with conflict ?
// @parent, Window | Collection
export const addItemToTarget = (item, parent) => {
  if (item.window) {
    // tab
    const window = tab.window
    const collection = window.collection
    let toCollection
    if (collection.conflict) {
      toCollection = toCollections.find((c) => c.id === collection.conflict)
    } else {
    }
  } else if (item.collection) {
    // window
  } else {
    // collection
  }
}
export const deleteItem = (item) => {
  item.deleted = true
}

export const moveTabsToWindow = (tabs: WrappedTab[], window: WrappedWindow) => {
  const clonedTabs = tabs.map(cloneWrappedTab)
  clonedTabs.map((t) => {
    t.window = window
    t.windowId = window.data.id
  })
  window.tabs = [...window.tabs, ...clonedTabs]
  return clonedTabs
}
export const moveWindowsToCollection = (
  windows: WrappedWindow[],
  collection: WrappedCollection,
) => {
  const clonedWindows = windows.map(cloneWrappedWindow)
  clonedWindows.map((w) => {
    // only move checked tabs
    w.tabs = w.tabs.filter((t) => t.checked)
    w.collection = collection
    w.collectionId = collection.data.id
  })
  collection.windows = [...collection.windows, ...clonedWindows]
  return clonedWindows
}
export const moveCollectionToList = (
  collection: WrappedCollection,
  list: WrappedCollection[],
) => {
  // 1. clone a new item
  const col = cloneWrappedCollection(collection)
  // only move checked windows/windows with checked tabs
  col.windows = col.windows.filter((w) => w.checked || w.indeterminate)
  col.windows.map((w) => {
    w.tabs = w.tabs.filter((t) => t.checked)
  })
  console.log("move collection cloned", col)
  // 2. add new item to target list
  list.value = [...list.value, col]
}

export const generateExportCollections = (
  collections: WrappedCollection[],
): Collection[] => {
  return collections.map((collection) => {
    // Create a new collection object with data from the wrapped collection
    const exportedCollection: Collection = {
      ...collection.data,
      windows: collection.windows.map((window) => {
        // Create a new window object with data from the wrapped window
        return {
          ...window.data,
          tabs: window.tabs.map((tab) => {
            // Create a new tab object with data from the wrapped tab
            return {
              ...tab.data,
            }
          }),
        }
      }),
    }

    return exportedCollection
  })
}
