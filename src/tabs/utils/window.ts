import { generateId } from "."

export const formatedWindow = (window) => {
  const innerWindowId = generateId()
  const newTabs = window.tabs.map((tab) => {
    return {...tab, windowId: innerWindowId}
  })
  return { ...window, tabs: newTabs, id: innerWindowId }
}
