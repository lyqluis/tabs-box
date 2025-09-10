import { useGlobalCtx } from "@/components/contexts/context"
import { useGlobalCtxSelector } from "@/components/data"
import {
	addTabs,
	removeTabs,
	updateEditedList,
	updateTabs,
} from "@/components/reducers/actions"
import { openTabs } from "@/utils/platform"
import { useCallback, useEffect, useMemo, useState } from "react"

const useSelect = () => {
	const {
		state: { currentId, collections },
		current,
		type,
		dispatch,
	} = useGlobalCtxSelector((v) => v)
	// always store current's selected
	const [selectedList, setSelectedList] = useState<Tab[]>([])

	const tabsByWindowMap = useMemo<Map<WindowId, Tab[]>>(() => {
		return selectedList.reduce((map, tab) => {
			if (!map.has(tab.windowId)) map.set(tab.windowId, [])
			map.get(tab.windowId).push(tab)
			return map
		}, new Map())
	}, [selectedList])

	// console.log(
	//   "🪝 useSelect - @selected list",
	//   selectedList,
	//   "@tabs grouped by window",
	//   tabsByWindowMap
	// )

	const onSelect = useCallback(
		({ tab, isSelected }) => {
			if (isSelected) {
				// add
				const existed = selectedList.find((t) => t.id === tab.id)
				if (existed) return
				setSelectedList([...selectedList, tab])
			} else {
				// remove
				setSelectedList(selectedList.filter((t) => t.url !== tab.url))
			}
			console.log("on select", tab, type, selectedList)
		},
		[selectedList]
	)

	// select window's all tabs
	const setTabsByWindow = (windowId: WindowId, tabs: Tab[]) => {
		setSelectedList((list) => {
			const restList = list.filter((tab) => tab.windowId !== windowId)
			return [...restList, ...tabs]
		})
	}

	const openSelected = () => {
		openTabs(selectedList)
		setSelectedList([])
	}
	// delete from reducer
	const deleteSelected = () => {
		const collectionId = type === "collection" ? current.id : ""
		tabsByWindowMap.forEach((tabs, windowId) => {
			const tabIds = tabs.map((tab) => tab.id)
			dispatch(removeTabs({ tabIds, windowId, collectionId }))
		})
		// TODO type is window/collection.window
		setSelectedList([])
		dispatch(updateEditedList({ id: current.id, type, isEdited: true }))
	}

	/**
	 * @func: set props in selected tabs, like `hidden: true`
	 * @param {Object} props {hidden: true}
	 * @param {Sting|Number} windowId
	 * @param {function} filter () => boolean
	 */
	const setSelected = (
		props: object,
		windowId?: WindowId,
		filter?: () => boolean
	) => {
		// console.log("useSelect - setSelected@current", current, windowId)
		const collectionId = type === "collection" ? current.id : ""

		if (windowId) {
			// set single target window's selected tabs
			let tabs = tabsByWindowMap.get(windowId)
			if (filter) {
				tabs = tabs.filter(filter)
			}
			// console.log("useSelect - setSelected@filter", tabs, filter)
			const newTabs = tabs.map((tab) => ({ ...tab, ...props }))
			dispatch(updateTabs({ tabs: newTabs, windowId, collectionId }))
		} else {
			// console.log("useSelect - setSelected@set all selected tabs")
			// set all selected tabs
			tabsByWindowMap.forEach((tabs, windowId) => {
				const newTabs = tabs.map((tab) => ({ ...tab, ...props }))
				dispatch(updateTabs({ tabs: newTabs, windowId, collectionId }))
			})
		}
	}

	const addSelectedToCollection = (collectionId, keep = false) => {
		// console.log("add selected to collection", collectionId)

		const originId = type === "collection" ? current.id : ""
		const collection = collections.find((c) => c.id === collectionId)
		const targetWindowId = collection.windows[0].id
		tabsByWindowMap.forEach((tabs, windowId) => {
			dispatch(
				addTabs({
					tabs,
					windowId: targetWindowId,
					collectionId,
				})
			)
			// delete tabs from origin collection
			if (!keep && type === "collection") {
				const tabIds = tabs.map((tab) => tab.id)
				dispatch(removeTabs({ tabIds, windowId, collectionId: originId }))
			}
		})
		// TODO: type is window/collection.window
		setSelectedList([])
		dispatch(updateEditedList({ id: collectionId, type, isEdited: true }))
		if (!keep) {
			dispatch(updateEditedList({ id: originId, type, isEdited: true }))
		}
	}

	useEffect(() => {
		setSelectedList([])
	}, [currentId])

	// dragover between list: collections updated, selected list should be updated
	useEffect(() => {
		setSelectedList((list) => {
			// find current the same new tab to replace selected list
			const newList = []
			list.map((preTab) => {
				current.windows.some((w) => {
					const newTab = w.tabs.find((t) => t.id === preTab.id)
					if (newTab) {
						newList.push(newTab)
					}
				})
			})
			return newList
		})
	}, [collections])

	return {
		selectedList,
		tabsByWindowMap,
		setSelectedList,
		setTabsByWindow,
		onSelect,
		openSelected,
		setSelected,
		deleteSelected,
		addSelectedToCollection,
	}
}

export default useSelect
