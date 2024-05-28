import { useEffect, useRef } from "react"

import { localSaveCollection } from "~tabs/store"

const parseJSON = (data) => {
  const collections = data.collections
  if (!collections || !collections.length) return
  // iterate collections to store locally
  collections.map((collection) => {
    collection.windows = collection.folders
    delete collection.folders
    localSaveCollection(collection)
  })
}

export const exportFile = (ext = "json", data) => {
  let link = document.createElement("a")
  const now = Date.now()
  link.download = `tab-box-config-${now}.${ext}`
  link.href = "data:text/plain," + JSON.stringify(data)
  link.click()
}

export const importFile = () => {
  // create a file input
  let input = document.createElement("input")
  input.type = "file"

  // bind change event
  input.addEventListener("change", (event) => {
    const files = event.target.files
    if (!files || !files.length) {
      input = null
      throw new Error("No files")
    }

    // use FileReader API read the data
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        let data = JSON.parse(event.target.result)
        console.log("import data:", data)
        // TODO parse data to store locally
        parseJSON(data)
        return data
      } catch (e) {
        throw new Error(e)
      }
      input = null
    }
    reader.readAsText(files[0])
  })

  // upload file
  input.click()
}

export const useRenderCount = () => {
  const renderCount = useRef(0)
  useEffect(() => {
    renderCount.current++
    console.log(`Component re-rendered: ${renderCount.current}`)
  }, [])
}
