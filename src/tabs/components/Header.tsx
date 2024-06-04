import { useGlobalCtx } from "./context"
import { importFile } from "./data"
import LoadingBtn from "./LoadingBtn"
import { exportData, importData } from "./reducers/actions"

const Header = () => {
  const { dispatch } = useGlobalCtx()
  const exportJSON = () => dispatch(exportData())
  const importJSON = async () => {
    const data = await importFile()
    dispatch(importData(data))
  }

  return (
    <header className="flex h-16 w-auto bg-danube-100">
      <h2>Tabs Box</h2>
      <div className="search flex">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered max-w-xs"
        />
        <button className="btn btn-outline btn-primary p-2">search</button>
      </div>
      <LoadingBtn onClick={exportJSON}>export</LoadingBtn>
      <LoadingBtn onClick={importJSON} loadingTime={3000}>
        import
      </LoadingBtn>
      <button className="btn btn-outline btn-primary p-2">apply</button>
    </header>
  )
}

export default Header
