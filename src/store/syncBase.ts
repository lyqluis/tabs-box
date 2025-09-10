import localforage from "localforage"

const BASE = localforage.createInstance({
  name: "baseCollections" // last remote sync collections
})

export const getBaseCollections = async () => {
  const collections: Collection[] = []
  await BASE.iterate((collection: Collection, key) => {
    collections.push(collection)
  })
  console.log("get local base collections: ", collections)
  return collections
}

export const setBaseCollection = (collection: Collection) => {
  BASE.setItem(collection.id, collection)
}

export const setAllBaseCollections = (collections: Collection[]) => {
  collections.map((col) => setBaseCollection(col))
}

export const clearAllBaseCollections = async () => {
  await BASE.clear().then(() => {
    console.log("local Base Collections cleared")
  })
}
