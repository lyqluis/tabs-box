import { arrayMove } from "@dnd-kit/sortable"

import { generateId } from "."
import { cloneTabs } from "./tab"

export const createWindow = (
  rawTabs: Tab[],
  collectionId?: string,
  collection?: Collection
) => {
  const id = generateId()
  const tabs = cloneTabs(rawTabs, id)
  const window = {
    id,
    tabs,
    collectionId,
    collection
  }
  tabs.map((tab) => {
    tab.window = window
  })
  return window
}

export const cloneWindow = (
  window,
  collectionId?: string,
  collection?: Collection
): Window => {
  const id = generateId()
  const clonedWindow = {
    ...window,
    id,
    tabs: cloneTabs(window.tabs, id),
    collectionId,
    collection
  }
  clonedWindow.tabs.map((tab) => {
    tab.window = clonedWindow
  })
  return clonedWindow
}

export const formatWindow = (window) => {
  const innerWindowId = generateId()
  const newTabs: Tab[] = window.tabs.map((tab) => {
    return { ...tab, windowId: innerWindowId, window: window }
  })
  return { ...window, tabs: newTabs, id: innerWindowId }
}

/**
 * @func: add new tabs to target window, return new windows with new target window with new tabs
 * @param {Tab[]} tabs
 * @param {string|number} windowId target window's id
 * @param {Window[]} windows
 * @param {number} index  specified index
 * @return {Window[]} new windows
 */
export const addTabsToWindow = (
  tabs: Tab[],
  windowId: number | string,
  windows: Window[],
  index?: number
): Window[] => {
  return windows.map((window) => {
    if (window.id === windowId) {
      if (index) {
        const newTabs = window.tabs.slice()
        newTabs.splice(index, 0, ...tabs)
        return { ...window, tabs: newTabs }
      }
      return { ...window, tabs: [...window.tabs, ...tabs] }
    }
    return window
  })
}

/**
 * @func: remove tabs from target window, return new windows with new target window with new tabs
 * @param {number|string[]} tabIds tabs' id
 * @param {string|number} windowId target window's id
 * @param {Window[]} windows
 * @return {Window[]} new windows
 */
export const removeTabsFromWindow = (
  tabIds: string | number[],
  windowId: number | string,
  windows: Window[]
) => {
  return windows.map((window) => {
    if (window.id === windowId) {
      const tabs = window.tabs.filter((tab) => !tabIds.includes(tab.id))
      return { ...window, tabs }
    }
    return window
  })
}

/**
 * @func: set tabs in target window, return new windows with new target window with new tabs
 * @param {Tab[]} tabs tabs with new props
 * @param {string|number} windowId target window's id
 * @param {Window[]} windows
 * @return {Window[]} new windows
 */
export const setTabsInWindow = (
  tabs: Tab[],
  windowId: WindowId,
  windows: Window[],
  index?: number
) => {
  const newTabs = tabs
  return windows.map((window) => {
    if (window.id === windowId) {
      // update tabs with new order
      if (index !== undefined) {
        const pinnedTabs = window.tabs.filter((t) => t.pinned)
        let reorderedTabs = window.tabs.filter((t) => !t.pinned).slice()
        newTabs.map((tab) => {
          const oldIndex = reorderedTabs.findIndex((t) => t.id === tab.id)
          if (oldIndex !== -1) {
            console.log(
              "set tabs in window - ",
              "@oldindex",
              oldIndex,
              "@index",
              index
            )
            reorderedTabs = arrayMove(reorderedTabs, oldIndex, index)
          }
        })
        return { ...window, tabs: [...pinnedTabs, ...reorderedTabs] }
      }
      // update tabs in place
      const tabs = window.tabs.map((tab) => {
        const newTab = newTabs.find((t) => t.id === tab.id)
        return newTab ? newTab : tab
      })
      return { ...window, tabs }
    }
    return window
  })
}

/**
 * @func: set new window in target windows, return new windows with new target window
 * @param {Window} window window with new props
 * @param {Window[]} windows collections.windows / reducer's windows
 * @return {Window[]} new windows
 */
export const updateWindowInWindows = (
  window: Window,
  windows: Window[],
  index?: number
): Window[] => {
  // update window with new order
  if (index !== undefined) {
    const oldIndex = windows.findIndex((w) => w.id === window.id)
    if (oldIndex !== -1) {
      return arrayMove(windows, oldIndex, index)
    }
  }
  // update window in place
  return windows.map((w) => {
    if (w.id === window.id) {
      return window
    }
    return w
  })
}
