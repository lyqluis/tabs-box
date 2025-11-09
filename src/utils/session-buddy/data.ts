import { hashCollection, hashWindow } from "./hash"

// NOTE: 只作增量处理, deprecated
// now use `compareCollectionsByTitleImproved` below
//
// export const compareCollectionsByTitle = async (
//   collections1: Collection[], // normalized session-buddy collections imported
//   collections2: Collection[], // collection from recuder
// ): Promise<Collection[]> => {
//   console.log("compare collections by title", collections1, collections2)
//   if (!collections1?.length) return collections2
//   if (!collections2?.length) return collections1
//
//   // 1. 处理所有有定义的title
//   // 创建映射：title -> collection
//   const createTitleMap = async (collections) => {
//     const map = new Map()
//     for (const col of collections) {
//       const title = col.title
//       // 忽略undefined和空字符串title
//       if (!title) continue
//       const hash = await hashCollection(col) // col.hash is set
//       // console.log("hash generated", hash)
//       map.set(title, col)
//     }
//     return map
//   }
//
//   const mapA = await createTitleMap(collections1)
//   const mapB = await createTitleMap(collections2)
//
//   // 最终合并结果
//   const mergedCollections: Collection[] = []
//
//   const allTitles = new Set([...mapA.keys(), ...mapB.keys()])
//
//   for (const title of allTitles) {
//     const hasA = mapA.has(title)
//     const hasB = mapB.has(title)
//
//     if (hasA && hasB) {
//       const colA = mapA.get(title)
//       const colB = mapA.get(title)
//       const hashA = colA.hash
//       const hashB = colB.hash
//
//       if (hashA === hashB) {
//         // 哈希相同，保留任意一个
//         mergedCollections.push(colB)
//       } else {
//         // 哈希不同，需要深度比较窗口
//         const resolvedCollection = await resolveCollectionConflict(colA, colB)
//         mergedCollections.push(resolvedCollection)
//       }
//     } else if (hasA) {
//       // 只在A中存在
//       mergedCollections.push(mapA.get(title))
//     } else if (hasB) {
//       // 只在B中存在
//       mergedCollections.push(mapB.get(title))
//     }
//   }
//
//   // 2. 处理无title的集合（title为''或undefined或null）
//   // 增量处理，全部保留，用户自己在本地删减
//   const filterUntitled = (collections) => {
//     return collections.filter((col) => !col.title)
//   }
//
//   const untitledA = filterUntitled(collections1)
//   const untitledB = filterUntitled(collections2)
//
//   // hash -> collection
//   const hashMap = new Map()
//
//   const addToHashMap = async (collections) => {
//     for (const col of collections) {
//       const hash = await hashCollection(col)
//       hashMap.set(hash, col)
//     }
//   }
//
//   await Promise.all([addToHashMap(untitledA), addToHashMap(untitledB)])
//
//   // 添加所有唯一的无title集合
//   for (const col of hashMap.values()) {
//     mergedCollections.push(col)
//   }
//   console.log(
//     "compare finished - ",
//     "length1:",
//     collections1.length,
//     "lenght2:",
//     collections2.length,
//     "result length:",
//     mergedCollections.length,
//     // mergedCollections,
//   )
//   return mergedCollections
// }
//
// // 用于通过title来匹配对比collection hash的冲突处理
// // 对于冲突collection，其windows只做增量处理
// async function resolveCollectionConflict(
//   collectionA,
//   collectionB,
// ): Promise<Collection> {
//   const mergedWindows = []
//   // hash -> window
//   const hashMap = new Map()
//   const addWindowToHashMap = async (windows) => {
//     for (const window of windows) {
//       if (!window.hash) {
//         await hashWindow(window)
//       }
//       const hash = window.hash
//       hashMap.set(hash, window)
//     }
//   }
//   await Promise.all([
//     addWindowToHashMap(collectionA.windows),
//     addWindowToHashMap(collectionB.windows),
//   ])
//
//   // TODO: 返回colB（本地），windows增量处理
//   for (const window of hashMap.values()) {
//     // const normalizedWindow = normalizeWindow(window, collectionB)
//     mergedWindows.push(normalizedWindow)
//   }
//   collectionB.windows = mergedWindows
//   return collectionB
// }

/**
 * Enhanced comparison function that properly handles collections with duplicate titles
 * @param collections1 - First set of collections to compare
 * @param collections2 - Second set of collections to compare
 * @returns Merged collection array with all collections preserved
 */
export const compareCollectionsByTitleImproved = async (
  collections1: Collection[],
  collections2: Collection[],
): Promise<Collection[]> => {
  if (!collections1?.length) return collections2
  if (!collections2?.length) return collections1

  // 1. Process collections with defined titles - create enhanced mapping
  const createEnhancedTitleMap = async (collections: Collection[]) => {
    const map = new Map<string, Collection[]>()

    for (const col of collections) {
      const title = col.title
      // Ignore undefined and empty string titles
      if (!title) continue

      // Use title as key but store arrays to handle duplicates
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

  // Final merged results
  const mergedCollections: Collection[] = []

  // Get all unique titles from both collections
  const allTitles = new Set([...mapA.keys(), ...mapB.keys()])

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
            mergedCollections.push(colB)
            foundMatch = true
            break
          }
        }

        // If no match found, add collection A (it's from imported data)
        if (!foundMatch) {
          mergedCollections.push(colA)
        }
      }

      // Add collections from B that weren't matched with A
      for (const colB of colsB) {
        const existsInResult = mergedCollections.some((c) => c.id === colB.id)
        if (!existsInResult) {
          mergedCollections.push(colB)
        }
      }
    } else if (hasA) {
      // Only in A - add all collections with this title
      const colsA = mapA.get(title)!
      mergedCollections.push(...colsA)
    } else if (hasB) {
      // Only in B - add all collections with this title
      const colsB = mapB.get(title)!
      mergedCollections.push(...colsB)
    }
  }

  // 2. Handle collections without titles (empty string, undefined, null)
  // Incremental processing, all kept, user can delete manually
  const filterUntitled = (collections: Collection[]) => {
    return collections.filter((col) => !col.title)
  }

  const untitledA = filterUntitled(collections1)
  const untitledB = filterUntitled(collections2)

  // Hash -> collection for untitled collections
  const hashMap = new Map<string, Collection>()

  const addToHashMap = async (collections: Collection[]) => {
    for (const col of collections) {
      const hash = await hashCollection(col)
      hashMap.set(hash, col)
    }
  }

  await Promise.all([addToHashMap(untitledA), addToHashMap(untitledB)])

  // Add all unique untitled collections
  for (const col of hashMap.values()) {
    mergedCollections.push(col)
  }

  console.log("compare finished (improved)", mergedCollections)
  return mergedCollections
}
