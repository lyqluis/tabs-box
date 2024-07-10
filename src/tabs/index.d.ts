interface Tab extends chrome.tabs.Tab {}

interface Window extends chrome.windows.Window {}

interface Collection {
  id: string
  created: number
  updated: number
  sourceType: "local-client" | "transfer" // local-client | transfer
  title?: string
  name?: string
  pinned?: string // pinned time
  windows: Window[]
}
