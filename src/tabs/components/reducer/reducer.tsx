import { useEffect, useReducer } from "react"

import { localRemoveCollection, localSaveCollection } from "~tabs/store"

import { Provider } from "../context"
import {
  REMOVE_COLLECTION,
  SET_COLLECTION,
  SET_COLLECTIONS,
  SET_CURRENT,
  SET_WINDOWS,
  setCollections,
  setWindows,
  SORT_COLLECTION
} from "./actions"

const initialJSON = {
  source: {},
  windows: [], // window[]
  collections: [], // window[]
  current: null
}

const window = {
  lastModified: "timestamp",
  created: "timestamp" // => json‘s created time
}

// TODO 
const setExistedCollectionOrWindow = (item, list, withLocalSave) => {
  let insertIdx = 0
  let removeCount = 1
  const newList = list.slice()
  insertIdx = list.findIndex(
    (c) => c.created === item.created || c.id === item.id // window only has id
  )
  newList.splice(insertIdx, removeCount, item)
  // set to local store
  if (withLocalSave) {
    localSaveCollection(item)
  }
  return newList
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT:
      return { ...state, current: action.payload }
    case SET_WINDOWS:
      return { ...state, windows: action.payload }
    case SET_COLLECTIONS:
      return { ...state, collections: action.payload }
    case SET_COLLECTION: {
      // set single collection
      let collection = action.payload
      let insertIdx = 0
      let removeCount = 1
      const newCollections = state.collections.slice()
      if (action.payload.created) {
        // set existed collection
        insertIdx = state.collections.findIndex(
          (c) => c.created === collection.created
        )
      } else {
        // add new collection
        const created = Date.now()
        // wrapper the window to collection data
        collection = {
          created,
          updated: created,
          title: collection.tabs[0]?.title ?? "", // give a default title
          windows: [collection]
        }
        // add to the first index after pinned
        insertIdx = state.collections.findIndex((c) => !c.pinned)
        removeCount = 0
      }
      const current = collection
      newCollections.splice(insertIdx, removeCount, collection)
      // set to local store
      localSaveCollection(collection)
      // switch current to the new one
      return { ...state, collections: newCollections, current }
    }
    case REMOVE_COLLECTION: {
      const target = action.payload
      const newCollections = state.collections.filter(
        (c) => c.created !== target.created
      )
      // set to local store
      localRemoveCollection(target)
      return {
        ...state,
        collections: newCollections,
        current: state.windows[0]
      }
    }
    case SORT_COLLECTION: {
      const collection = action.payload
    }
    // other case...
  }
}

export const ProviderWithReducer = ({
  data: { windows, collections },
  children
}) => {
  const [state, dispatch] = useReducer(reducer, initialJSON)
  // set initial windows & collections
  useEffect(() => {
    dispatch(setWindows(windows))
    dispatch(setCollections(collections))
  }, [windows, collections])

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
