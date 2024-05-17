import "./style"

import { useEffect, useState } from "react"

import Content from "./components/Content"
import Header from "./components/Header"
import { ProviderWithReducer } from "./components/reducer/reducer"
import SideBar from "./components/SideBar"
import { getAllCollections } from "./store"

const TabsBoxPage = () => {
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState([])
  const [collections, setCollections] = useState([])
  const [current, setCurrent] = useState(null)

  // get all tabs info
  const getTabs = async () => {
    try {
      const allWindows = await chrome.windows.getAll({ populate: true })
      // set current window to the first of the list
      const currentWindowIdx = allWindows.findIndex((w) => w.focused)
      const currentWindow = allWindows.splice(currentWindowIdx, 1)
      allWindows.unshift(...currentWindow)
      console.log("all windows", allWindows)
      setWindows(allWindows)
      setCurrent(allWindows[0])
    } catch (err) {
      console.error("Error get tabs:", err)
    }
  }

  const getCollections = async () => {
    try {
      const allCollections = await getAllCollections()
      // set pinned collection to the first of the list & sort by date
      const pinnedCollections = allCollections
        .filter((c) => c.pinned)
        .sort((a, b) => b.updated - a.updated)
      const restCollections = allCollections
        .filter((c) => !c.pinned)
        .sort((a, b) => b.updated - a.updated)
      console.log("all collectioins from store", allCollections)
      setCollections([...pinnedCollections, ...restCollections])
    } catch (err) {
      console.error("Error get collections:", err)
    }
  }

  const getData = async () => {
    try {
      await getTabs()
      await getCollections()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  if (loading) {
    return <h2>loading</h2>
  }

  return (
    <ProviderWithReducer data={windows}>
      <div className="flex">
        <SideBar
          windows={windows}
          collections={collections}
          onSelect={setCurrent}
          current={current}></SideBar>
        <main className="w-full overflow-hidden">
          <Header></Header>
          <Content selectedItem={current}></Content>
        </main>
      </div>
    </ProviderWithReducer>
  )
}

export default TabsBoxPage
