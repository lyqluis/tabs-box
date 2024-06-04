import "./style"

import { useEffect, useState } from "react"

import Content from "./components/Content"
import { DialogProvider } from "./components/Dialog/DialogContext"
import Header from "./components/Header"
import { ProviderWithReducer } from "./components/reducers/reducer"
import SideBar from "./components/SideBar"
import { getAllCollections } from "./store"
import { getAllWindows } from "./utils/platform"

const TabsBoxPage = () => {
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState([])
  const [collections, setCollections] = useState([])
  const [current, setCurrent] = useState(null)

  // get all tabs info
  const getTabs = async () => {
    try {
      const allWindows = await getAllWindows()
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
    <ProviderWithReducer data={{ windows, collections }}>
      <DialogProvider>
        <div className="flex">
          <SideBar></SideBar>
          <main className="w-full overflow-hidden">
            <Header></Header>
            <Content></Content>
          </main>
        </div>
      </DialogProvider>
    </ProviderWithReducer>
  )
}

export default TabsBoxPage
