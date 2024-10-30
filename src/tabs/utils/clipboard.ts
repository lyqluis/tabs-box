const clipboard = []

type ClipItem = {
  type?: "window" | "tab" | "collection"
  data: Window | Collection | Tab | Window[] | Tab[]
  copiedTime: number
}

// sidebar window => collection, add window to target collection
// collection => collection, add collection's windows to target collection
// selected tabs => collection, add new window with selected tabs to target collection
// selected window => collection, add selected window to target collection
// collection, copy collection as a new collection

export const createClippedItem = (data, type): ClipItem => {
  const copiedData = Array.isArray(data) ? [...data] : { ...data }
  return {
    type,
    data,
    copiedTime: Date.now()
  }
}

export const pushToClipboard = (item) => {
  // most store 5 copied data
  if (clipboard.length >= 3) clipboard.shift()
  clipboard.push(item)
  console.log("clipboard updated", item)
  return true
}

export const popFromClipboard = () => {
  const copiedBoard = clipboard.slice()
  return copiedBoard.pop()
}
