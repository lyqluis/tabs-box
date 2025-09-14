import { useGlobalCtxSelector } from "@/components/data"
import { setCollections } from "@/components/data/actions"
import { localSaveCollection } from "@/store"
import { sortCollections } from "@/utils/collection"
import { compareCollections, importFile } from "@/utils/data"
import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"

import useAsyncAction from "./useAsyncAction"
import useModal from "./useModal"

// import hook
const useImport = (outModalInstance?: any) => {
	const [isImporting, setIsImporting] = useState(false)
	const modalInstance = useRef(null)
	// reducer state
	const { collections, dispatch } = useGlobalCtxSelector((v) => ({
		collections: v.state.collections,
		dispatch: v.dispatch,
	}))
	const { modal } = useModal()
	const [importLength, setImportLength] = useState(collections.length)

	// _, clickEvent
	const importData = async (_, importJson) => {
		setIsImporting(true)
		flushSync(() => {
			// incase the next import length will not update
			setImportLength(collections.length)
		})

		// 1. import file
		// click IMPORT button
		if (!importJson) {
			// console.log("🪝📁 useImport click IMPORT button")
			importJson = await importFile({
				onFileConfirmed: () => {
					modalInstance.current = modal.open({
						message: "Processing",
						content: (
							<span className='loading loading-spinner loading-lg'></span>
						),
					})
				},
				onFileCanceled: () => {
					setIsImporting(false)
				},
			})
		}

		// 1.1 compare data with old one
		// NOTE: compatibal with session-buddy
		// data is created by export, use 'title' mode;
		// data is created by backup, use 'id' mode
		const mode = importJson.backupId || importJson.exportId ? "id" : "title"
		let newCollections = importJson.collections
		newCollections = await compareCollections(
			newCollections,
			collections,
			// mode
			"title"
		)
		// console.log("import, compare finished", newCollections)
		// 1.2 format collections
		// TODO: delete, no need, cause all done in normalizeData()
		// newCollections = formatCollections(newCollections)

		// 1.3 sort collections
		newCollections = sortCollections(newCollections)
		// 2. set to reducer
		dispatch(setCollections(newCollections))
		console.log("import, dispatch", newCollections)
		// 3. set to localStorage
		newCollections.map((collection) => localSaveCollection(collection))
		// 4. set imported collection length
		setImportLength((preLength) =>
			Math.max(newCollections.length - preLength, 0)
		)
	}

	const { isExecuting, error, execute } = useAsyncAction(importData)

	useEffect(() => {
		console.log("🪝📁 useImport @isExecuting", isExecuting)
		if (!isExecuting && isImporting) {
			setIsImporting(false)
			console.log("modal-instance", modalInstance)
			if (outModalInstance?.current) {
				outModalInstance.current?.update({
					message: `Done! Import ${importLength} collections`,
					content: null,
					cancelText: "Ok",
				})
			} else {
				modalInstance.current?.update({
					message: `Done! Import ${importLength} collections`,
					content: null,
					cancelText: "Ok",
				})
			}
		}
	}, [importLength])

	return { isImporting, execute, error }
}

export default useImport
