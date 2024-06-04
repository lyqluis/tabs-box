import { useEffect } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  addTab,
  removeTab,
  setCurrent,
  setWindows,
  updateTab
} from "~tabs/components/reducers/actions"

export const getCurrentWindow = async () => {
  const current = await chrome.windows.getCurrent()
  if (!CURRENT_WINDOW) CURRENT_WINDOW = current
  return current
}

// get the current window with the app(tabs-box page)
export let CURRENT_WINDOW
getCurrentWindow()

export const getAllWindows = async () => {
  const allWindows = await chrome.windows.getAll({ populate: true })
  // set current window to the first of the list
  const currentWindow = CURRENT_WINDOW
  const currentWindowIdx = allWindows.findIndex(
    (w) => w.id === currentWindow.id
  )
  if (currentWindowIdx !== 0) {
    ;[allWindows[0], allWindows[currentWindowIdx]] = [
      allWindows[currentWindowIdx],
      allWindows[0]
    ]
  }
  return allWindows
}

export const getWindow = async (id) => {
  const window = await chrome.windows.get(id, { populate: true })
  return window
}

export const useTabEvents = () => {
  const {
    state: { current },
    dispatch
  } = useGlobalCtx()

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
  const onTabMoved = async (id, { fromIndex, toIndex, windowId }) => {
    console.log("on tab move", id, windowId)
    const newWindows = await getAllWindows()
    dispatch(setWindows(newWindows))
    const currentId = current.id
    if (currentId === windowId) {
      const newCurrent = newWindows.find((window) => window.id === windowId)
      dispatch(setCurrent(newCurrent))
    }
  }
  const onDetached = async (id, { oldPosition, oldWindowId }) => {
    console.log("👂 tab detached")
    const newWindows = await getAllWindows()
    dispatch(setWindows(newWindows))
    // set new current window which includes the tab
    const current = newWindows.find((window) =>
      window.tabs.find((t) => t.id === id)
    )
    dispatch(setCurrent(current))
  }

  useEffect(() => {
    chrome.tabs.onCreated.addListener(onTabCreated)
    chrome.tabs.onUpdated.addListener(onTabUpdated)
    chrome.tabs.onRemoved.addListener(onTabRemoved)
    chrome.tabs.onMoved.addListener(onTabMoved)
    chrome.tabs.onDetached.addListener(onDetached)

    return () => {
      chrome.tabs.onCreated.removeListener(onTabCreated)
      chrome.tabs.onUpdated.removeListener(onTabUpdated)
      chrome.tabs.onRemoved.removeListener(onTabRemoved)
      chrome.tabs.onMoved.removeListener(onTabMoved)
      chrome.tabs.onDetached.removeListener(onDetached)
    }
  }, [current])
}

export const useWindowEvents = () => {
  const {
    state: { windows, current },
    dispatch
  } = useGlobalCtx()

  const onWindowCreated = async (window) => {
    console.log("👂window created", window)
    const newWindows = await getAllWindows()
    dispatch(setWindows(newWindows))
  }
  const onWindowRemoved = async (id) => {
    console.log("👂window removed", id)
    const newWindows = await getAllWindows()
    dispatch(setWindows(newWindows))
    // set current to the window focused
    if (current.id === id) {
      const currentWindow = await getCurrentWindow()
      dispatch(setCurrent(windows.find((w) => w.id === currentWindow.id)))
    }
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
