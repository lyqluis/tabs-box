/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface Tab extends chrome.tabs.Tab {
  id: string | number
  hidden?: boolean // control the display while dragging
  checked?: boolean // TODO: delete, no use
  windowId: number | string
  collectionId?: string
  window?: Window | "[Circular]"
}

interface Window extends chrome.windows.Window {
  id: string | number // number refers to window, string refers to collection.window
  tabs: Tab[]
  title?: string
  collectionId?: string // ? need collectionId?
  collection?: Collection | "[Circular]"
  hash?: string
}

type WindowId = Window["id"]

interface Collection {
  id: string
  created: number
  updated: number
  sourceType: "local-client" | "transfer" | "session-buddy" // local-client | transfer
  title?: string
  name?: string
  pinned?: string // pinned time
  windows: Window[]
  rawId?: string // session-buddy's id
  hash?: string
}

type CollectionId = Collection["id"]

type clipItem = {
  type: "window" | "tab" | "collection"
  data: Window | Collection | Tab | Window[] | Tab[]
  copiedTime: number
}
