interface Tab extends chrome.tabs.Tab {
  hidden?: boolean // control the display while dragging
  checked: boolean
}

interface Window extends chrome.windows.Window {
  id: sting | number // number refers to window, string refers to collection.window
  collectionId?: string // ? need collectionId?
  tabs: Tab[]
}

type WindowId = Window["id"]

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

type CollectionId = Collection["id"]
