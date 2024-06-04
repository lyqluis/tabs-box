import { useEffect } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  addTab,
  removeTab,
  setCurrent,
  setWindows,
  updateTab
} from "~tabs/components/reducers/actions"

export const getAllWindows = async () => {
  const allWindows = await chrome.windows.getAll({ populate: true })
  // set current window to the first of the list
  const currentWindowIdx = allWindows.findIndex((w) => w.focused)
  const currentWindow = allWindows.splice(currentWindowIdx, 1)
  allWindows.unshift(...currentWindow)
  return allWindows
}

export const getWindow = async (id) => {
  const window = await chrome.windows.get(id, { populate: true })
  return window
}

export const useTabEvents = () => {
  const { dispatch } = useGlobalCtx()

  const onTabCreated = async (tab) => {
    console.log("on tab created", tab)
    dispatch(addTab(tab))
  }
  const onTabUpdated = (id, info, tab) => {
    console.log("on tab update", tab)
    dispatch(updateTab(tab))
  }
  const onTabRemoved = async (id, { windowId }) => {
    console.log("on tab remove", id, windowId)
    dispatch(removeTab(id, windowId))
  }

  useEffect(() => {
    chrome.tabs.onCreated.addListener(onTabCreated)
    chrome.tabs.onUpdated.addListener(onTabUpdated)
    chrome.tabs.onRemoved.addListener(onTabRemoved)

    return () => {
      chrome.tabs.onCreated.removeListener(onTabCreated)
      chrome.tabs.onUpdated.removeListener(onTabUpdated)
      chrome.tabs.onRemoved.removeListener(onTabRemoved)
    }
  }, [])
}

export const useWindowEvents = () => {
  const {
    state: { windows, current },
    dispatch
  } = useGlobalCtx()

  const onWindowCreated = async (window) => {
    console.log("👂window created", window)
    // add with refresh api
    // const newWindows = await getAllWindows()
    // dispatch(setWindows(newWindows))

    // add with code
    const newWindows = windows.slice()
    if (!newWindows.includes(window)) {
      newWindows.push(window)
    }
    dispatch(setWindows(newWindows))
  }
  const onWindowRemoved = async (id) => {
    console.log("👂window removed", id)
    // add with refresh api
    // const newWindows = await getAllWindows()
    // dispatch(setWindows(newWindows))

    // add with code
    const newWindows = windows.filter((w) => w.id !== id)
    dispatch(setWindows(newWindows))
    // change current
    if (current.id === id) {
      dispatch(setCurrent(newWindows[0]))
    }
  }
  const onTabUpdated = (id, info, tab) => {
    console.log("👂", tab)
    dispatch(updateTab(tab))
  }

  useEffect(() => {
    chrome.windows.onCreated.addListener(onWindowCreated)
    chrome.windows.onRemoved.addListener(onWindowRemoved)
    // chrome.windows.onBoundsChanged.addListener()

    return () => {
      chrome.windows.onCreated.removeListener(onWindowCreated)
      chrome.windows.onRemoved.removeListener(onWindowRemoved)
      // chrome.windows.onBoundsChanged.removeListener(onTabUpdated)
    }
  }, [windows, current])
}
