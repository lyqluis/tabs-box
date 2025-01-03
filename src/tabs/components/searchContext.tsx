import Fuse from "fuse.js"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import Cross from "react:~assets/svg/cross.svg"
import Folder from "react:~assets/svg/folder.svg"

import useDropdown from "../hooks/useDropdown"
import { useGlobalCtx } from "./context"
import { setCurrentId } from "./reducers/actions"

interface SearchContextType {
  query: string
  searchResult: any[]
  jumped: any
  setJumped: (item: any) => void
  handleSearch: (event: any) => void
}
const searchContext = createContext<SearchContextType>({
  query: "",
  searchResult: [],
  jumped: null,
  setJumped: null,
  handleSearch: null
})

const { Provider } = searchContext

export const useSearchCtx = () => useContext(searchContext)

// fuse options
// https://www.fusejs.io/api/options.html#location
const options = {
  keys: ["title", "url"],
  threshold: 0.0 // default: 0.6
}

const flatCollections = (collections: Collection[]): any[] => {
  console.log("flatCollections")

  return collections.reduce((acc, collection) => {
    const windowsAndTabs = collection.windows.reduce((tabs, window) => {
      return tabs.concat(window, window.tabs)
    }, [])
    return acc.concat(collection, windowsAndTabs)
  }, [])
}

export const highlight = (text: string, query?: string) => {
  if (!query) return text

  const regex = new RegExp(`(${query})`, "gi")
  const parts = text.split(regex) // split to array with regex, capture group will be included in the array

  return parts.map((part, index) => {
    return part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    )
  })
}

export const SearchProvider = ({ children }) => {
  const {
    state: { collections }
  } = useGlobalCtx()
  const [query, setQuery] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [jumped, setJumped] = useState(null)

  const fuse = new Fuse(flatCollections(collections), options)

  const handleSearch = (event) => {
    const query = event.target.value
    setQuery(query)

    if (query.trim() === "") {
      setSearchResult([])
    } else {
      const results = fuse.search(query)
      setSearchResult(results.map((result) => result.item))
      console.log("search result: ", results, query)
    }
  }

  useEffect(() => {
    jumped &&
      setTimeout(() => {
        setJumped(null)
      }, 3000)
  }, [jumped])

  return (
    <Provider value={{ query, searchResult, jumped, setJumped, handleSearch }}>
      {children}
    </Provider>
  )
}

// TODO:
// 1. in search mode, filter sidebar collections
// 2. highlight search result in both sidebar and content
export const Search = () => {
  const { dispatch } = useGlobalCtx()
  const { query, searchResult, setJumped, handleSearch } = useSearchCtx()
  const inputRef = useRef(null)
  const [isFocus, setIsFocus] = useState(false)
  // dropdown
  const { Dropdown, toggleRef, handleToggle } = useDropdown()

  const handleFocus = (e) => {
    if (!e) return
    e.preventDefault()
    if (e.target.value) {
      handleToggle(true)
    }
    setIsFocus(true)
  }
  const handleBlur = (e) => {
    setIsFocus(false)
    handleToggle(false)
  }
  const handleChange = (e) => {
    e.preventDefault && e.preventDefault()
    if (e.target.value === "") {
      handleToggle(false)
    } else if (!query) {
      handleToggle(true)
    }
    handleSearch(e)
  }
  const handleClick = (item) => {
    let collectionId
    if (item.created) {
      collectionId = item.id
    } else {
      collectionId = item.collectionId ?? item?.window?.collectionId
    }
    dispatch(setCurrentId(collectionId))
    setJumped(item)
  }
  const handleClear = (e) => {
    e.preventDefault()
    inputRef.current.value = ""
    inputRef.current.focus()
    handleChange({ target: inputRef.current })
  }

  // listen global `/` keydown event
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault()
        inputRef.current.focus()
        // focus in the end of the input
        const length = inputRef.current.value.length
        inputRef.current.setSelectionRange(length, length)
      } else if (event.key === "Escape") {
        inputRef.current.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <label
        className="input input-bordered mr-2 flex items-center gap-2"
        ref={toggleRef}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-5 w-5 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          className="grow"
          placeholder="Search"
          value={query}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          ref={inputRef}
        />
        <Cross
          className={`${query ? "visible" : "invisible"} h-4 w-4 cursor-pointer`}
          onClick={handleClear}
        />
        <kbd className="kbd kbd-sm pointer-events-none">
          {isFocus ? "esc" : "/"}
        </kbd>
      </label>
      <Dropdown className="max-w-[60vw] min-w-[50vw] overflow-x-hidden">
        {searchResult.length > 0
          ? searchResult.map((item) => (
          <li key={item.id}>
            <a
              className="flex w-full font-light"
              onClick={() => handleClick(item)}
            >
              <div className="m-0.5 w-6 flex-none">
                {item.url ? (
                  <i className="flex w-full flex-none items-center justify-center">
                    <img src={item.favIconUrl} alt="" className="w-4" />
                  </i>
                ) : (
                  <i className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gray-300">
                    <Folder className="h-auto w-4 fill-slate-700" />
                  </i>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="line-clamp-2 text-base">
                  {highlight(item.title, query)}
                </p>
                {item.url && (
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-400">
                    {highlight(item.url, query)}
                  </p>
                )}
                {/* //TODO: clone/copy window/collection, tab.window, window.collection */}
                <p className="text-xs text-slate-500">
                  {item.created ? (
                    "Collection"
                  ) : (
                    <>
                      From Collection{" "}
                      <span className="font-medium">
                        {highlight(
                          item?.collectionId
                            ? item?.collection?.title
                            : item.windowId
                              ? item?.window?.collection?.title
                              : "",
                          query
                        )}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </a>
          </li>
            ))
          : "No result"}
      </Dropdown>
    </>
  )
}
