import Content from "@/components/Content"
// import Content from "@/components/Content2"
// import { ProviderWithReducer } from "@/components/contexts/context"
import { ProviderWithReducer } from "@/components/data"
import { OperationsProvider } from "@/components/contexts/operationsContext"
import { DndGlobalContext } from "@/components/Dnd"
// import Header from "@/components/Header"
import { SearchProvider } from "@/components/search/searchContext"
// import { SettingsProvider } from "@/components/setting/settingContext"
import SideBar from "@/components/SideBar"
// import ToastContainer from "@/components/Toast"
import { getAllCollections } from "@/store"
// import { HistoryProvider } from "@/utils/operationStack"
// import { getAllWindows } from "@/utils/platform"
import { Header } from "./components/tst/Header"

const App = () => {
  return (
    <ProviderWithReducer>
      {/* setting context */}
      {/* <SearchProvider> */}
      <OperationsProvider>
        <DndGlobalContext>
          <div className="flex">
            <SideBar />
            <main className="flex h-screen w-full flex-col overflow-hidden">
              <Header />
              <Content />
            </main>
          </div>
        </DndGlobalContext>
      </OperationsProvider>
      {/* </SearchProvider> */}
    </ProviderWithReducer>
  )
}

export default App
