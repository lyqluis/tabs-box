import { updateWindowInWindows } from "./window"

export const sortCollections = (collections: Collection[]): Collection[] => {
  const pinnedCollections = collections
    .filter((c) => c.pinned)
    .sort((a, b) => b.updated - a.updated)
  const restCollections = collections
    .filter((c) => !c.pinned)
    .sort((a, b) => b.updated - a.updated)
  return [...pinnedCollections, ...restCollections]
}

/**
 * @func: add new window to target collection, return new collections with new target collection with new window
 * @param {Window} window
 * @param {CollectionId} collectionId target collection id
 * @param {Collection} collections reducer's collections
 * @return {{Collection[], Collection}} new collections
 */
export const addWindowToCollection = (
  window: Window,
  collectionId: CollectionId,
  collections: Collection[]
): { collections: Collection[]; targetCollection: Collection } => {
  let targetCollection
  const newCollections = collections.map((collection) => {
    if (collection.id === collectionId) {
      window.collection = collection
      window.collectionId = collectionId
      targetCollection = {
        ...collection,
        windows: [...collection.windows, window]
      }
      return targetCollection
    }
    return collection
  })
  return { collections: newCollections, targetCollection }
}

/**
 * @func: remove window from target window, return new collections with new target collection with new windows
 * @param {number|string} windowId
 * @param {CollectionId} collectionId target collection id
 * @param {Collection} collections reducer's collections
 * @return {{Collection[], Collection}} new collections & target collection
 */
export const removeWindowFromCollection = (
  windowId: number | string,
  collectionId: CollectionId,
  collections: Collection[]
): { collections: Collection[]; targetCollection: Collection } => {
  let targetCollection
  const newCollections = collections.map((collection) => {
    if (collection.id === collectionId) {
      const windows = collection.windows.filter(
        (window) => window.id !== windowId
      )
      targetCollection = { ...collection, windows }
      return targetCollection
    }
    return collection
  })
  return { collections: newCollections, targetCollection }
}

/**
 * @func: update window in target collection.windows, return new collections with new target collection with new windows
 * @param {number|string} windowId
 * @param {CollectionId} collectionId target collection id
 * @param {Collection} collections reducer's collections
 * @param {number} index new index of window
 * @return {{Collection[], Collection}} new collections & updated collection
 */
export const updateWindowInCollections = (
  window: Window,
  collectionId: string,
  collections: Collection[],
  index?: number
): { collections: Collection[]; updatedCollection: Collection } => {
  let updatedCollection
  const newCollections = collections.map((colletion) => {
    if (colletion.id === collectionId) {
      const windows = updateWindowInWindows(window, colletion.windows, index)
      updatedCollection = { ...colletion, windows }
      return updatedCollection
    }
    return colletion
  })
  return {
    collections: newCollections,
    updatedCollection
  }
}
