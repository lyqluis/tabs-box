import "../style"

import { exportFile, importFile } from "./json"

const Header = () => {
  const exportJSON = () => {
    exportFile("json", { name: "client", time: Date.now() })
  }
  return (
    <header className="h-16 w-auto bg-danube-100 flex">
      header
      <h2>Tabs Box</h2>
      <button
        className="p-2 bg-white border border-solid border-danube-600"
        onClick={exportJSON}>
        export
      </button>
      <button
        className="p-2 bg-white border border-solid border-danube-600"
        onClick={importFile}>
        import
      </button>
      <button className="p-2 bg-white border border-solid border-danube-600">
        add a new collection
      </button>
      <button className="p-2 bg-white border border-solid border-danube-600">
        save to collection
      </button>
      <button>apply</button>
    </header>
  )
}

export default Header
