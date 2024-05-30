interface Collection {
  id: string
  created: number
  updated: number
  sourceType: 'local-client' | 'transfer'  // local-client | transfer
  title?: string
  name?: string
  windows: chrome.windows.Window[]
}
