import { generateId } from "."

export const cloneTab = (tab: Tab): Tab => ({
  ...tab,
  id: generateId()
})

export const cloneTabs = (tabs: Tab[]): Tab[] =>
  tabs.map((tab) => cloneTab(tab))
