import "./style"

import { DragOverlay } from "@dnd-kit/core"
import { useEffect, useState } from "react"

import Content from "./components/Content"
import { DialogProvider } from "./components/Dialog/DialogContext"
import { DndGlobalContext } from "./components/Dnd"
import Header from "./components/Header"
import { OverlayListItem } from "./components/list/ListItem"
import { Sortable } from "./components/list/Sortable"
import { ProviderWithReducer } from "./components/reducers/reducer"
import SideBar from "./components/SideBar"
import ToastContainer from "./components/Toast"
import { SelectProvider } from "./hooks/useSelect"
import { getAllCollections } from "./store"
import { HistoryProvider } from "./utils/operationStack"
import { getAllWindows } from "./utils/platform"

const TabsBoxPage = () => {
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState([])
  const [collections, setCollections] = useState([])

  // get all tabs info
  const getTabs = async () => {
    try {
      const allWindows = await getAllWindows()
      console.log("all windows", allWindows)
      setWindows(allWindows)
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
      <HistoryProvider>
        <DialogProvider>
          <SelectProvider>
            <DndGlobalContext>
              {/* <Sortable
            // list={tabs}
            // setList={setTabs}
            // multiList={selectedList}
            // onSortEnd={onSortEnd}
            > */}
              <div className="flex">
                <SideBar></SideBar>
                <main className="flex h-screen w-full flex-col overflow-hidden">
                  <Header></Header>
                  <Content></Content>
                </main>
              </div>
              <DragOverlay>
                {/* {activeId ? <Item id={activeId} /> : null} */}
                <OverlayListItem></OverlayListItem>
              </DragOverlay>
              <ToastContainer></ToastContainer>
              {/* </Sortable> */}
            </DndGlobalContext>
          </SelectProvider>
        </DialogProvider>
      </HistoryProvider>
    </ProviderWithReducer>
  )
}

export default TabsBoxPage
