interface Tab extends chrome.tabs.Tab {
  id: string | number
  hidden?: boolean // control the display while dragging
  checked: boolean
}

interface Window extends chrome.windows.Window {
  id: sting | number // number refers to window, string refers to collection.window
  tabs: Tab[]
  collectionId?: string // ? need collectionId?
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
  type: 'window' | 'tab' | 'collection'
  data: Window | Collection | Tab | Window[] | Tab[]
  copiedTime: number
}