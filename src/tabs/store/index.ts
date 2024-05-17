import localforage from "localforage"

const COLLECTIONS = localforage.createInstance({
  name: "collections"
})

export const saveCollection = (window, isNew = true) => {
  let collection = window
  if (isNew) {
    // wrapper the window to collection data
    const created = Date.now()
    collection = {
      created,
      updated: created,
      title: window.tabs[0]?.title ?? "", // give a default title
      windows: [window]
    }
  }
  COLLECTIONS.setItem(collection.created.toString(), collection)
}

export const removeCollection = (collection) => {
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
