import localforage from "localforage"

const COLLECTIONS = localforage.createInstance({
  name: "collections"
})

export const localSaveCollection = (collection) => {
  COLLECTIONS.setItem(collection.created.toString(), collection)
}

export const localGetCollection = () => {}

export const localRemoveCollection = (collection) => {
  const created = collection.created.toString()
  COLLECTIONS.removeItem(created)
}

export const getAllCollections = async () => {
  const collections = []
  await COLLECTIONS.iterate((collection, key) => {
    collections.push(collection)
  })
  return collections
}
