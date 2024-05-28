export const createCollection = (window: chrome.windows.Window) => {
  // add new collection
  const created = Date.now()
  // wrapper the window in a collection
  const collection = {
    created,
    updated: created,
    title: window.tabs[0]?.title ?? "", // give a default title
    windows: [window]
  }
  return collection
}

export const updateCollection = (collection) => {
  const updated = Date.now()
  collection.updated = updated
  return collection
}
