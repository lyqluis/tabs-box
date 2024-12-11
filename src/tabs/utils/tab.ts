import { generateId } from "."

export const cloneTab = (tab: Tab, windowId?): Tab => ({
  ...tab,
  id: generateId(),
  windowId
})

export const cloneTabs = (tabs: Tab[], windowId?): Tab[] =>
  tabs.map((tab) => cloneTab(tab, windowId))
