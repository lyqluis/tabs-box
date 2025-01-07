interface Tab extends chrome.tabs.Tab {
  id: string | number
  hidden?: boolean // control the display while dragging
  checked: boolean
  windowId: nubmer | string
  collectionId?: string
  window?: Window
}

interface Window extends chrome.windows.Window {
  id: sting | number // number refers to window, string refers to collection.window
  tabs: Tab[]
  title?: string
  collectionId?: string // ? need collectionId?
  collection?: Collection
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

type clipItem = {
  type: "window" | "tab" | "collection"
  data: Window | Collection | Tab | Window[] | Tab[]
  copiedTime: number
}
