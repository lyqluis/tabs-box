import { useGlobalCtx } from "@/components/contexts/context"
import {
	addCollection,
	addTabs,
	addWindow,
	removeCollection,
	setCurrentId,
	updateCollection,
	updateEditedList,
} from "@/components/reducers/actions"
import { useSettings } from "@/components/setting/settingContext"
import { toast } from "@/components/Toast"
import {
	createClippedItem,
	popFromClipboard,
	pushToClipboard,
} from "@/utils/clipboard"
import { cloneCollection, createCollection } from "@/utils/data"
import { closeWindow, jumptToWindow, openWindow } from "@/utils/platform"
import { cloneTab } from "@/utils/tab"
import { cloneWindow, createWindow } from "@/utils/window"
import { useCallback, useEffect, useMemo, useRef } from "react"

import useModal from "./useModal"
import { useGlobalCtxSelector } from "@/components/contexts/data"

// TODO: use `collectoin` param to replace `current`
const useOperations = (selectOperations) => {
	// window
	// - save as new collection
	// - save to collection
	// - go to window
	// - close window
	// collectioin
	// - pinned
	// - edit title
	// - clone collection
	// - open collection
	// - delete collection
	// selected tabs
	// other
	// - copy
	// - paste

	const {
		state: { windows, collections, currentId },
		current,
		dispatch,
	} = useGlobalCtxSelector((v) => v)
	const { modal } = useModal()
	const { selectedList, tabsByWindowMap, addSelectedToCollection } =
		selectOperations
	// TODO:
	const { settings } = useSettings()

	const saveCurrentToCollection = useCallback(
		(collection?) => {
			const formatedWindow = cloneWindow(current)
			// save window to existed collection
			if (collection) {
				dispatch(
					addWindow({ window: formatedWindow, collectionId: collection.id })
				)
				dispatch(setCurrentId(collection.id))
				return
			}
			// save window as new collection
			collection = createCollection(formatedWindow)
			dispatch(addCollection(collection))
			dispatch(setCurrentId(collection.id))
		},
		[current, dispatch]
	)

	const openChooseCollectionDialog = useCallback(() => {
		modal.open({
			message: "choose a collection to save",
			title: "Save to collection",
			content: (
				// TODO: inner shadow only top & bottom
				<div className='max-h-[50vh] overflow-y-auto'>
					<ul className='menu'>
						<div className='w-full shadow'></div>
						{collections.map((collection) => (
							<li
								onClick={() => {
									saveCurrentToCollection(collection)
									modal.destroy()
								}}
								key={collection.id}
							>
								<a>{collection.title}</a>
							</li>
						))}
					</ul>
				</div>
			),
			cancelText: "Cancel",
		})
	}, [currentId, collections])

	// clone collection
	const clone = useCallback(() => {
		const collection = cloneCollection(current)
		dispatch(addCollection(collection))
		dispatch(setCurrentId(collection.id))
	}, [current, dispatch])

	const openCollection = useCallback(async () => {
		const { windows } = current
		let newWindowId
		windows &&
			(await windows.map(
				async (window) => (newWindowId = await openWindow(window))
			))
		// BUG: ?? todo can't get new window id right now
		dispatch(setCurrentId(newWindowId))
	}, [current, dispatch])

	const deleteCollection = useCallback(
		(collection = current) => {
			if (settings?.confirm.confirmDeletingColelctions) {
				modal.open({
					title: "Warn",
					message: `collection '${collection.title}' will be permanently deleted`,
					confirmText: "Ok",
					cancelText: "Cancel",
					// TODO: param: useCloudSync
					onConfirm: () => dispatch(removeCollection(collection)),
				})
				return
			}
			dispatch(removeCollection(collection))
		},
		[settings, current, modal, dispatch]
	)
	const deleteWindow = useCallback(() => {
		if (settings?.confirm.confirmClosingWindows) {
			modal.open({
				title: "Warn",
				message: `Target window will be permanently closed`,
				confirmText: "Ok",
				cancelText: "Cancel",
				onConfirm: () => closeWindow(current.id),
			})
			return
		}
		closeWindow(current.id)
	}, [settings, current, modal])

	const pinnedCollection = useCallback(
		(collection = current) => {
			collection.pinned = !collection.pinned
			dispatch(updateCollection(collection))
		},
		[current, dispatch]
	)

	const goToWindow = useCallback(() => {
		jumptToWindow(current.id)
	}, [current])

	const setCollectionTitle = useCallback(
		(title) => {
			current.title = title
			dispatch(updateCollection(current))
		},
		[current, dispatch]
	)

	const activeTitleInput = useCallback((ref) => {
		return () => ref.current.active()
	}, [])

	// can not get latest selectedList value, so use a ref to get lastest value
	const selectedRef = useRef(null)
	useEffect(() => {
		// console.log("useOperations @selectedList", selectedList, tabsByWindowMap)
		selectedRef.current = { selectedList, tabsByWindowMap }
	}, [selectedList])

	type CopyProps = {
		value: any
		type: "tab" | "window" | "collection"
	}
	const copy = useCallback(
		({ value, type }: CopyProps) => {
			const res = pushToClipboard(createClippedItem(value, type))
			// const msg = type === "collection" ? "" : "selected"
			const msg = type === "tab" ? "selected" : type // 'window' | 'collection'
			// TODO: [enhance] if copy item is single tab, copy tab's url to system's clipboard
			res && toast?.current.show({ title: `Copied ${msg}!`, message: "" })
		},
		[toast]
	)

	const paste = (target: Collection | Window) => {
		const item = popFromClipboard()
		if (item) {
			console.log("get item from clipboard", item, "to", target)

			const { data, type } = item
			// target is colletion, add new window to the target
			if ("created" in target) {
				// target.created existed, target is collection
				if (type === "window") {
					// console.log("paste window")
					let window = data
					window = cloneWindow(window, target.id)
					dispatch(addWindow({ window, collectionId: target.id }))
				} else if (type === "collection") {
					// console.log("paste collection")
					const collection = data
					const windows = collection.windows
					windows.map((window) => {
						const clonedwindow = cloneWindow(window)
						dispatch(
							addWindow({ window: clonedwindow, collectionId: target.id })
						)
					})
				} else if (type === "tab") {
					// console.log("paste selected tabs")
					const tabs = data
					const window = createWindow(tabs, target.id)
					dispatch(addWindow({ window, collectionId: target.id }))
				}

				// notify to save or save directly
				dispatch(
					updateEditedList({
						type: "collection",
						id: target.id,
						isEdited: true,
					})
				)
			} else {
				// target is window
				// get all tabs in data, add tabs to the window
				let allTabs = data // data is tabs
				if (type === "collection") {
					allTabs = data.windows.reduce((tabs, window) => {
						tabs.push(...window.tabs)
						return tabs
					}, [])
				} else if (type === "window") {
					allTabs = data.tabs
				}

				// clone all tabs to target window
				allTabs = allTabs.map((tab) => cloneTab(tab, target.id))
				dispatch(
					addTabs({
						tabs: allTabs,
						windowId: target.id,
						collectionId: currentId,
					})
				)

				// TODO: no use, delete
				// notify to save or save directly
				// dispatch(
				//   updateEditedList({
				//     type: "collection",
				//     id: current.id,
				//     isEdited: true
				//   })
				// )
			}
			// dispatch(setCollectionWithLocalStorage(target))
		} else {
			toast.current.show({
				title: "Clipboard is empty!",
				message: "Please copy some tabs first",
				type: "error",
			})
		}
	}

	return {
		goToWindow,
		deleteWindow,
		openCollection,
		pinnedCollection,
		saveCurrentToCollection,
		deleteCollection,
		openChooseCollectionDialog,
		activeTitleInput,
		setCollectionTitle,
		copy,
		paste,
		clone,
	}
}

export default useOperations
