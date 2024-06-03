import { useEffect } from "react"

import { useGlobalCtx } from "~tabs/components/context"
import { addTab, removeTab, updateTab } from "~tabs/components/reducer/actions"

export const getAllWindows = async () => {
  const allWindows = await chrome.windows.getAll({ populate: true })
  // set current window to the first of the list
  const currentWindowIdx = allWindows.findIndex((w) => w.focused)
  const currentWindow = allWindows.splice(currentWindowIdx, 1)
  allWindows.unshift(...currentWindow)
  return allWindows
}

export const getWindow = async (id) => {
  const window = await chrome.windows.get(id, { populate: true })
  return window
}

export const useTabEvents = () => {
  const { dispatch } = useGlobalCtx()

  const onTabCreated = async (tab) => {
    console.log("on tab created", tab)
    dispatch(addTab(tab))
  }
  const onTabUpdated = (id, info, tab) => {
    console.log("on tab update", tab)
    dispatch(updateTab(tab))
  }
  const onTabRemoved = async (id, { windowId }) => {
    console.log("on tab remove", id, windowId)
    dispatch(removeTab(id, windowId))
  }

  useEffect(() => {
    chrome.tabs.onCreated.addListener(onTabCreated)
    chrome.tabs.onUpdated.addListener(onTabUpdated)
    chrome.tabs.onRemoved.addListener(onTabRemoved)

    return () => {
      chrome.tabs.onCreated.removeListener(onTabCreated)
      chrome.tabs.onUpdated.removeListener(onTabUpdated)
      chrome.tabs.onRemoved.removeListener(onTabRemoved)
    }
  }, [])
}
