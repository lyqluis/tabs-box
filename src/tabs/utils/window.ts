import { generateId } from "."

export const formatedWindow = (window) => {
  const innerWindowId = generateId()
  const newTabs = window.tabs.map((tab) => {
    return { ...tab, windowId: innerWindowId }
  })
  return { ...window, tabs: newTabs, id: innerWindowId }
}

/**
 * @func: add new tabs in target window, return new windows with new target window with new tabs
 * @param {Tab[]} tabs
 * @param {string|number} windowId target window's id
 * @param {Window[]} windows
 * @return {Window[]} new windows
 */
export const addTabsToWindow = (
  tabs: Tab[],
  windowId: number | string,
  windows: Window[]
): Window[] => {
  return windows.map((window) => {
    if (window.id === windowId) {
      return { ...window, tabs: [...window.tabs, ...tabs] }
    }
    return window
  })
}

/**
 * @func: remove tabs in target window, return new windows with new target window with new tabs
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
