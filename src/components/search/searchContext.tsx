import Cross from "@/assets/svg/cross.svg?react"
import Folder from "@/assets/svg/folder.svg?react"
import SearchSvg from "@/assets/svg/search.svg?react"
import WindowSvg from "@/assets/svg/window.svg?react"
import Icon from "@/components/Icon"
import { setCurrentId } from "@/components/data/actions"
import useDropdown from "@/hooks/useDropdown"
import { debounce } from "es-toolkit"
import Fuse from "fuse.js"
import {
	type ChangeEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react"
import { createContext, useContextSelector } from "@/hooks/useContextSelector"
import { useGlobalCtxSelector } from "../data"

interface SearchContextType {
	query: string
	isSearching: boolean
	searchResult: any[]
	jumped: any
	setJumped: (item: any) => void
	handleSearch: (event: any) => void
}
const searchContext = createContext({
	query: "",
	isSearching: false,
	searchResult: [],
	jumped: null,
	setJumped: (item: any) => void 0,
	handleSearch: (event: any) => void 0,
})

const { Provider } = searchContext

export const useSearchContextSelector = (
	selector: (value: SearchContextType) => unknown
) => useContextSelector(searchContext, selector)

// fuse options
// https://www.fusejs.io/api/options.html#location
const options = {
	keys: ["title", "url"],
	threshold: 0.3, // default: 0.6
}

const flatCollections = (collections: Collection[]): any[] => {
	return collections.reduce((acc, collection) => {
		const windowsAndTabs = flatWindows(collection.windows)
		return acc.concat(collection, windowsAndTabs)
	}, [])
}
const flatWindows = (windows: Window[]): any[] => {
	return windows.reduce((tabs, window) => {
		return tabs.concat(window, window.tabs)
	}, [])
}

// 转义特殊字符
const escapeRegExp = (string) => string.replace(/[.*+?^${}()\/|[\]\\]/g, "\\$&")

export const highlight = (text: string, query?: string) => {
	if (!query || !text) return text

	const regex = new RegExp(`(${escapeRegExp(query)})`, "gi")
	const parts = text.split(regex) // split to array with regex, capture group will be included in the array

	return parts.map((part, index) => {
		return part.toLowerCase() === query.toLowerCase() ? (
			<mark key={index}>{part}</mark>
		) : (
			part
		)
	})
}

export const SearchProvider = ({ children }: { children: ReactNode }) => {
	const { collections, windows } = useGlobalCtxSelector((v) => ({
		collections: v.state.collections,
		windows: v.state.windows,
	}))
	const [query, setQuery] = useState("")
	const [searchResult, setSearchResult] = useState([])
	const [jumped, setJumped] = useState(null)
	const [isSearching, setIsSearching] = useState(false)

	// console.log("fuse data:", flatCollections(collections), flatWindows(windows))

	const fuse = useMemo(
		() =>
			new Fuse(
				[...flatWindows(windows), ...flatCollections(collections)],
				options
			),
		[collections, windows]
	)

	// NOTE: perf
	// 1. debounce
	// 2. separate input value from query value
	// setting value in the block will cause input delay in the Search component
	const handleSearch = useCallback(
		debounce((value: string) => {
			setIsSearching(true)
			const query = value
			setQuery(query)

			if (query.trim() === "") {
				setSearchResult([])
			} else {
				const results = fuse.search(query) // no input delay
				setSearchResult(results.map(({ item }) => item)) // input delay
				console.log("search result: ", results, query)
			}
			setIsSearching(false)
		}, 300),
		[fuse]
	)

	useEffect(() => {
		jumped &&
			setTimeout(() => {
				setJumped(null)
			}, 3000)
	}, [jumped])

	return (
		<Provider
			value={{
				query,
				isSearching,
				searchResult,
				jumped,
				setJumped,
				handleSearch,
			}}
		>
			{children}
		</Provider>
	)
}

// TODO:
// 1. in search mode, filter sidebar collections
// 2. highlight search result in both sidebar and content (Done)
export const Search = () => {
	const dispatch = useGlobalCtxSelector((v) => v.dispatch)
	const { query, isSearching, searchResult, setJumped, handleSearch } =
		useSearchContextSelector((v) => ({
			query: v.query,
			isSearching: v.isSearching,
			searchResult: v.searchResult,
			setJumped: v.setJumped,
			handleSearch: v.handleSearch,
		}))
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [inputValue, setInputValue] = useState("")
	const [isFocus, setIsFocus] = useState(false)
	const [pending, startTransition] = useTransition()
	// dropdown
	const { Dropdown, toggleRef, handleToggle } = useDropdown()

	const handleFocus = useCallback(
		(e) => {
			if (!e) return
			e.preventDefault()
			if (e.target.value) {
				handleToggle(true)
			}
			setIsFocus(true)
		},
		[handleToggle]
	)
	const handleBlur = useCallback(
		(e) => {
			setIsFocus(false)
			handleToggle(false)
		},
		[handleToggle]
	)
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
			// e.preventDefault && e.preventDefault()
			const value = e.target.value
			if (value === "") {
				// input is cleared, do not open Dropdown
				handleToggle(false)
			} else if (!inputValue) {
				// input is occurred, but inputValue is not updated
				handleToggle(true)
			}
			setInputValue(value)

			// NOTE: use `startTransition` to mark this as a low-priority render
			// to prevent input lag caused by setValue in the Context.
			startTransition(() => {
				handleSearch(value)
			})
		},
		[handleToggle, handleSearch]
	)
	const handleClick = (item) => {
		let collectionId
		if (item.created) {
			collectionId = item.id
		} else {
			collectionId = item.collectionId ?? item?.window?.collectionId
		}
		console.log("jump to ", item)
		dispatch(setCurrentId(collectionId))
		setJumped(item)
	}
	const handleClear = (e: MouseEvent) => {
		e.preventDefault()
		setInputValue("")
		inputRef.current?.focus()
		handleChange({ target: { value: "" } }) // close Dropdown, clear query and search results
	}

	// listen global `/` keydown event
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "/" && document.activeElement !== inputRef.current) {
				event.preventDefault()
				inputRef.current?.focus()
				// focus in the end of the input
				const length = inputRef.current?.value.length ?? 0
				inputRef.current?.setSelectionRange(length, length)
			} else if (event.key === "Escape") {
				inputRef.current?.blur()
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
				className='input mr-2 flex items-center gap-2 focus-within:border-none focus-within:outline-2'
				style={{
					outlineColor: "var(--color-primary)",
					outlineOffset: "0",
				}}
				ref={toggleRef}
			>
				<Icon
					Svg={SearchSvg}
					className='h-5 w-5 flex-none opacity-70'
				/>
				<input
					type='text'
					className='grow'
					placeholder='Search'
					value={inputValue}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onChange={handleChange}
					ref={inputRef}
				/>

				<Icon
					Svg={Cross}
					className={
						(query ? "visible" : "invisible") +
						" h-4 w-4 flex-none cursor-pointer"
					}
					onClick={handleClear}
				/>
				<kbd className='kbd kbd-sm pointer-events-none'>
					{isFocus ? "esc" : "/"}
				</kbd>
			</label>
			<Dropdown className='max-w-[60vw] min-w-[50vw] overflow-x-hidden'>
				{pending || isSearching ? (
					<p className='text-center'>Searching...</p>
				) : searchResult.length <= 0 ? (
					<p className='text-center'>No Result</p>
				) : (
					searchResult.map((item) => (
						<li key={item.id}>
							<a
								className='flex w-full font-light'
								onPointerDown={() => handleClick(item)}
							>
								<div className='m-0.5 w-6 flex-none'>
									{item.url ? (
										// tab icon
										<i className='flex w-full flex-none items-center justify-center'>
											<img
												src={item.favIconUrl}
												alt=''
												className='w-4'
											/>
										</i>
									) : (
										<i className='flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gray-300'>
											{item.type ? (
												// window icon
												<Icon
													Svg={WindowSvg}
													width={4}
													fill='fill-slate-700'
												/>
											) : (
												// collection icon
												<Icon
													Svg={Folder}
													width={4}
													fill='fill-slate-700'
												/>
											)}
										</i>
									)}
								</div>
								<div className='overflow-hidden'>
									<p className='line-clamp-2 text-base'>
										{highlight(item.title ?? "window", query)}
									</p>
									{item.url && (
										<p className='overflow-hidden text-sm text-ellipsis whitespace-nowrap text-slate-400'>
											{highlight(item.url, query)}
										</p>
									)}
									{/* //TODO: clone/copy window/collection, tab.window, window.collection */}
									<p className='text-xs text-slate-500'>
										{item.created ? (
											"Collection"
										) : typeof item.windowId === "number" ? (
											"From Window"
										) : (
											<>
												From Collection{" "}
												<span className='font-medium'>
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
				)}
			</Dropdown>
		</>
	)
}
