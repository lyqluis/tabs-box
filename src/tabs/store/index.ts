import localforage from "localforage"

const COLLECTIONS = localforage.createInstance({
  name: "collections"
})

// can directly cover old data
export const localSaveCollection = (collection) => {
  // TODO
  // get local current same key collection by id
  // compare id & updated time between the two
  COLLECTIONS.setItem(collection.id, collection)
}

export const localGetCollection = async (id) => {
  return
}

export const localRemoveCollection = (collection) => {
  const created = collection.id.toString()
  COLLECTIONS.removeItem(created)
}

export const getAllCollections = async () => {
  const collections = []
  await COLLECTIONS.iterate((collection, key) => {
    collections.push(collection)
  })
  return collections
}
