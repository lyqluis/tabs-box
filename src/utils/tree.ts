import type { WrappedCollection } from "../types/data"

export const findRootCollection = (item: any): WrappedCollection => {
  return item?.collection ?? item?.window?.collection ?? item
}

export const checkParent = (
  item: any,
  parent: string, // collection | window
  children: string, // windows | tabs
) => {
  const parentNode = item[parent]
  const childrenNode = item[parent][children]
  let allChecked = true
  let allUnchecked = true

  for (const childNode of childrenNode) {
    if (childNode.indeterminate) {
      allChecked = false
      allUnchecked = false
      break
    }
    if (childNode.checked) {
      allUnchecked = false
    } else {
      allChecked = false
    }
  }

  if (allChecked) {
    parentNode.checked = true
    parentNode.indeterminate = false
  } else if (allUnchecked) {
    parentNode.checked = false
    parentNode.indeterminate = false
  } else {
    parentNode.checked = false
    parentNode.indeterminate = true
  }
}

export const checkTree = (item: any, checked: boolean) => {
  // update node
  item.checked = checked

  if (item.windows) {
    // collection
    item.indeterminate = false
    item.windows.map((window) => {
      window.checked = checked
      window.indeterminate = false
      window.tabs.map((tab) => {
        tab.checked = checked
      })
    })
  } else if (item.tabs) {
    // window
    item.indeterminate = false
    item.tabs.map((tab) => {
      tab.checked = checked
    })
    checkParent(item, "collection", "windows")
  } else {
    // tab
    checkParent(item, "window", "tabs")
    checkParent(item.window, "collection", "windows")
  }
  return findRootCollection(item)
}
