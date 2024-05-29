import { exportFile, importFile } from "../utils"

const Header = () => {
  const exportJSON = () => {
    exportFile("json", { name: "client", time: Date.now() })
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
      <button className="btn btn-outline btn-primary p-2" onClick={exportJSON}>
        export
      </button>
      <button className="btn btn-outline btn-primary p-2" onClick={importFile}>
        import
      </button>
      <button className="btn btn-outline btn-primary p-2">apply</button>
    </header>
  )
}

export default Header
