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
 * @return {Collection[]} new collections
 */
export const addWindowToCollection = (
  window: Window,
  collectionId: CollectionId,
  collections: Collection[]
): Collection[] => {
  return collections.map((collection) => {
    if (collection.id === collectionId) {
      return { ...collection, windows: [...collection.windows, window] }
    }
    return collection
  })
}

/**
 * @func: remove window from target window, return new collections with new target collection with new windows
 * @param {number|string} windowId
 * @param {CollectionId} collectionId target collection id
 * @param {Collection} collections reducer's collections
 * @return {Collection[]} new collections
 */
export const removeWindowFromCollection = (
  windowId: number | string,
  collectionId: CollectionId,
  collections: Collection[]
): Collection[] => {
  return collections.map((collection) => {
    if (collection.id === collectionId) {
      const windows = collection.windows.filter(
        (window) => window.id !== windowId
      )
      return { ...collection, windows }
    }
    return collection
  })
}

/**
 * @func: update window in target collection.windows, return new collections with new target collection with new windows
 * @param {number|string} windowId
 * @param {CollectionId} collectionId target collection id
 * @param {Collection} collections reducer's collections
 * @param {number} index new index of window
 * @return {Collection[]} new collections
 */
export const updateWindowInCollections = (
  window: Window,
  collectionId: string,
  collections: Collection[],
  index?: number
): (Window | Collection)[] => {
  return collections.map((colletion) => {
    if (colletion.id === collectionId) {
      const windows = updateWindowInWindows(window, colletion.windows, index)
      return { ...colletion, windows }
    }
    return colletion
  })
}
