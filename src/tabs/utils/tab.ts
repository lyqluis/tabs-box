import { generateId } from "."

export const cloneTab = (tab: Tab, windowId?, window?): Tab => ({
  ...tab,
  id: generateId(),
  windowId,
  window
})

export const cloneTabs = (tabs: Tab[], windowId?, window?): Tab[] =>
  tabs.map((tab) => cloneTab(tab, windowId, window))
