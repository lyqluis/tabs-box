import { useEffect } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import {
  addTab,
  removeTab,
  removeTabs,
  setCurrent,
  setWindow,
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

export const openWindow = async (window): WindowId => {
  const createData = {
    focused: false,
    // setSelfAsOpener: false,
    height: window.height,
    incognito: window.incognito,
    left: window.left,
    top: window.top,
    type: "normal",
    width: window.width
    // url: window.tabs.map((tab) => tab.url)
  }
  const pinnedTabs = window.tabs.filter((t) => t.pinned)
  const newWindow = await chrome.windows.create(createData)
  // use tab method to create tab with old options
  // new window's tabs' id changed, should update new tab with same url
  window.tabs.map((tab) => {
    chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: tab.index,
      windowId: newWindow?.id
    })
  })
  // remove the default new tab in the window
  console.log("open a new window", pinnedTabs, newWindow)
  const blankTab = newWindow?.tabs[0]
  if (blankTab) {
    chrome.tabs.remove(blankTab.id)
  }

  return newWindow?.id
}

export const closeWindow = (windowId: number): Promise<void> => {
  return chrome.windows.remove(windowId)
}

export const applyWindow = async (window) => {
  // todo
  const updateInfo = {}
  // find old window
  const target = await getWindow(window.id)
  // update window state
  chrome.windows.update(target.id, updateInfo)
  // todo update window url
  // compare tabs between window and target
  const oldTabs = target.tabs
  const tabs = window.tabs
  const { creates, moves, removes } = compareTabs(oldTabs, tabs)
  console.log(
    "🌍 apply window",
    "@creates",
    creates,
    "@moves",
    moves,
    "@removes",
    removes
  )
  moves.length &&
    moves.map((tab) => chrome.tabs.move(tab.id, { index: tab.index }))
  removes.length && chrome.tabs.remove(removes)
  creates.length && openTabs(creates, target.id)
}

export const jumptToWindow = (id) => {
  chrome.windows.update(id, { focused: true })
}

export const jumptToTab = (tab: chrome.tabs.Tab) => {
  chrome.tabs.update(tab.id, { active: true })
}

export const openTabs = (tabs, windowId?: number) => {
  if (Array.isArray(tabs)) {
    tabs.map((tab) => {
      chrome.tabs.create({
        url: tab.url,
        pinned: tab.pinned,
        active: false,
        windowId
      })
    })
    return
  }
  const tab = tabs
  chrome.tabs.create({
    url: tab.url,
    pinned: tab.pinned,
    active: false
  })
}

// TODO
const compareTabs = (oldTabs, tabs) => {
  let i = 0
  const removes: number[] = []
  const moves = []
  while (i < oldTabs.length) {
    const oldTab = oldTabs[i++]
    const tabIndex = tabs.findIndex((t) => t.url === oldTab.url && !t.compared)
    const tab = tabs[tabIndex]
    if (tabIndex > -1) {
      if (oldTab.index !== tabIndex) {
        tab.index = tabIndex
        moves.push(tab)
      }
      tab.compared = true
    } else {
      removes.push(oldTab.id)
    }
  }
  const creates = tabs.filter((t) => !t.compared)
  return { creates, moves, removes }
}

export const useTabEvents = () => {
  const {
    state: { current },
    dispatch
  } = useGlobalCtx()

  const onTabCreated = async (tab) => {
    console.log("on tab created", tab)
    try {
      const window = await getWindow(tab.windowId)
      console.log("--gat all tabs", window)
      dispatch(setWindow(window))
    } catch (err) {
      console.error("Error get all tabs:", err)
    }
  }
  const onTabUpdated = (id, info, tab) => {
    console.log("on tab update", tab)
    dispatch(updateTab(tab))
  }
  const onTabRemoved = async (id, { windowId }) => {
    console.log("on tab remove", id, "in", windowId)
    dispatch(removeTabs({ tabIds: [id], windowId }))
  }
  const onTabMoved = async (id, { fromIndex, toIndex, windowId }) => {
    console.log("on tab move", id, windowId)
    const newWindows = await getAllWindows()
    dispatch(setWindows(newWindows))
    // const currentId = current.id
    // if (currentId === windowId) {
    //   const newCurrent = newWindows.find((window) => window.id === windowId)
    //   dispatch(setCurrent(newCurrent))
    // }
  }
  const onDetached = async (id, { oldPosition, oldWindowId }) => {
    console.log("👂 tab detached")
    const newWindows = await getAllWindows()
    dispatch(setWindows(newWindows))
    // set new current window which includes the tab
    // const current = newWindows.find((window) =>
    //   window.tabs.find((t) => t.id === id)
    // )
    // dispatch(setCurrent(current))
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
    // if (current.id === id) {
    //   const currentWindow = await getCurrentWindow()
    //   dispatch(setCurrent(windows.find((w) => w.id === currentWindow.id)))
    // }
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
