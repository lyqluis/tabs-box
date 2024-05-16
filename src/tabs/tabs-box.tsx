import "./style"

import { useEffect, useState } from "react"

import { List } from "./components/list"
import SideBar from "./components/SideBar"

const groupBy = (arr, key) => {
  const groups = arr.reduce((groups, item) => {
    if (!groups[item[key]]) {
      groups[item[key]] = []
    }
    groups[item[key]].push(item)
    return groups
  }, {})
  return groups
}

const TabsBoxPage = () => {
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState([])
  const [windows, setWindows] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const selectWindow = (i) => () => setCurrentIdx(i)
  const selectedWindow = windows[currentIdx]

  // get all tabs info
  const getTabs = async () => {
    try {
      // // get tabs by chrome.tabs api
      // const tabs = await chrome.tabs.query({})
      // // group by windowId
      // const allWindowTabs = groupBy(tabs, "windowId")
      // const tabsByWindows = Object.entries(allWindowTabs)
      // setTabs(tabsByWindows)
      // console.table(tabs, ["favIconUrl", "title", "url"])
      // console.log("windows", chrome.windows)

      const allWindows = await chrome.windows.getAll({ populate: true })
      // set current window to the first of the list
      const currentWindowIdx = allWindows.findIndex((w) => w.focused)
      const currentWindow = allWindows.splice(currentWindowIdx, 1)
      allWindows.unshift(...currentWindow)
      console.log("all windows", allWindows)
      setWindows(allWindows)
    } catch (err) {
      console.error("Error get tabs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTabs()
  }, [])

  if (loading) {
    return <h2>loading</h2>
  }

  return (
    <div className="flex">
      {/* // TODO when select item from sidebar, change the display in main content */}
      <SideBar
        windows={windows}
        selectWindow={selectWindow}
        currentIdx={currentIdx}></SideBar>
      <main className="w-full overflow-hidden">
        <header className="h-16 w-auto bg-danube-100">
          header
          <h2>Tabs Box</h2>
        </header>
        <List window={selectedWindow}></List>
      </main>
    </div>
  )
}

export default TabsBoxPage
