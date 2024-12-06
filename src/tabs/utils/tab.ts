import { generateId } from "."

export const cloneTab = (tab: Tab) => ({
  ...tab,
  id: generateId()
})
