import { hashCollection } from "./hash"

export const formatData = (file) => {
  const { collections } = file

  const res = collections.map((col) => {
    const windows = col.folders ?? col.windows
    col.windows = windows.map((w) => {
      const tabs = w.links ?? w.tabs
      w.tabs = tabs.map((t) => {
        t.window = w
        t.windowId = w.id
        return t
      })
      if (w.links) delete w.links
      w.collection = col
      w.collectionId = col.id
      return w
    })
    if (col.folders) delete col.folders
    return col
  })

  return sortCollection(res)
}

const sortCollection = (collections: any[]) => {
  return collections.sort((a, b) => a.created - b.created)
}

/**
 * Enhanced comparison function that properly handles collections with duplicate titles
 * @param collections1 - First set of collections to compare
 * @param collections2 - Second set of collections to compare
 * @returns Merged collection array with all collections preserved
 */
export const compareCollectionsByTitleImproved = async (
  collections1: any[],
  collections2: any[],
): Promise<any[]> => {
  if (!collections1?.length) return collections2
  if (!collections2?.length) return collections1

  // 1. Process collections with defined titles - create enhanced mapping
  const createEnhancedTitleMap = async (collections) => {
    const map = new Map()

    for (const col of collections) {
      const title = col.title
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

  const sameCollections = []
  const conflictCollectionsA = []
  const conflictCollectionsB = []

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
          const hashA = colA.hash
          const hashB = colB.hash

          if (hashA === hashB) {
            // Hashes match, keep one (prefer B as it's from local storage)
            sameCollections.push(colB)
            foundMatch = true
            break
          }
        }

        // If no match found, add collection A (it's from imported data)
        if (!foundMatch) {
          conflictCollectionsA.push(colA)
        }
      }

      // Add collections from B that weren't matched with A
      for (const colB of colsB) {
        const existsInResult = sameCollections.some((c) => c.id === colB.id)
        if (!existsInResult) {
          conflictCollectionsB.push(colB)
        }
      }
    } else if (hasA) {
      // Only in A - add all collections with this title
      const colsA = mapA.get(title)!
      conflictCollectionsA.push(...colsA)
    } else if (hasB) {
      // Only in B - add all collections with this title
      const colsB = mapB.get(title)!
      conflictCollectionsB.push(...colsB)
    }
  }

  // TODO:
  // 2. Handle collections without titles (empty string, undefined, null)
  // Incremental processing, all kept, user can delete manually
  const filterUntitled = (collections: any[]) => {
    return collections.filter((col) => !col.title)
  }

  const untitledA = filterUntitled(collections1)
  const untitledB = filterUntitled(collections2)

  // Hash -> collection for untitled collections
  // const hashMapA = new Map<string, any>()
  const hashMapB = new Map<string, any>()

  const generateHash = async (collections: any[]) => {
    for (const col of collections) {
      const hash = await hashCollection(col)
    }
  }
  const addToHashMap = async (collections: any[], hashMap) => {
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
    const hash = colA.hash
    if (hashMapB.has(hash)) {
      sameCollections.push(colA)
      hashMapB.delete(hash)
    } else {
      conflictCollectionsA.push(colA)
    }
  }

  // Add all unique untitled collections
  for (const col of hashMapB.values()) {
    conflictCollectionsB.push(col)
  }

  tagConfictCollections(conflictCollectionsA, conflictCollectionsB)

  return { sameCollections, conflictCollectionsA, conflictCollectionsB }
}

// tag conflict collections between A and B
// find out those with the same name or id but not undefined
const tagConfictCollections = (collectionsA, collectionsB) => {
  for (const colA of collectionsA) {
    const titleA = colA.title
    const idA = colA.id
    const hashA = colA.hash
    const colB = collectionsB.find(
      (c) => c.id === idA || (titleA && c.title === titleA) || c.hash === hashA,
    )
    if (colA && colB) {
      colA.conflict = colB.id
      colB.conflict = colA.id
    }
  }
}

// TODO:
// tag in compare that window should be tagged with conflict ?
export const addItemToTarget = (item, toCollections) => {
  if (item.window) {
    // tab
    const window = tab.window
    const collection = window.collection
    let toCollection
    if (collection.conflict) {
      toCollection = toCollections.find((c) => c.id === collection.conflict)
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
