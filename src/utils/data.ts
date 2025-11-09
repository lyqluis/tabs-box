import { hashCollection } from "./hash"

export const formatData = (file) => {
	const { collections } = file

	return collections.map((col) => {
		const windows = col.folders ?? col.windows
		col.windows = windows.map((w) => {
			const tabs = w.links ?? w.tabs
			w.tabs = tabs.map((t) => {
				t.window = w
				t.windowId = w.id
				return t
			})
			if (w.links) delete w.links
			w.collection = col
			w.collectionId = col.id
			return w
		})
		if (col.folders) delete col.folders
		return col
	})
}

/**
 * Enhanced comparison function that properly handles collections with duplicate titles
 * @param collections1 - First set of collections to compare
 * @param collections2 - Second set of collections to compare
 * @returns Merged collection array with all collections preserved
 */
export const compareCollectionsByTitleImproved = async (
	collections1: any[],
	collections2: any[]
): Promise<any[]> => {
	if (!collections1?.length) return collections2
	if (!collections2?.length) return collections1

	// 1. Process collections with defined titles - create enhanced mapping
	const createEnhancedTitleMap = async (collections) => {
		const map = new Map()

		for (const col of collections) {
			const title = col.title
			// Ignore undefined and empty string titles
			if (!title) continue

			// * Use title as key but store arrays to handle duplicates
			if (!map.has(title)) {
				map.set(title, [])
			}
			const hash = await hashCollection(col) // col.hash is set
			map.get(title)!.push(col)
		}
		return map
	}

	const mapA = await createEnhancedTitleMap(collections1)
	const mapB = await createEnhancedTitleMap(collections2)

	// TODO:
	const sameCollections = []
	const conflictCollectionsA = []
	const conflictCollectionsB = []

	// Final merged results
	const mergedCollections = []

	// Get all unique titles from both collections
	const allTitles = new Set([...mapA.keys(), ...mapB.keys()])

	for (const title of allTitles) {
		const hasA = mapA.has(title)
		const hasB = mapB.has(title)

		if (hasA && hasB) {
			// Multiple collections with same title in both sets
			const colsA = mapA.get(title)!
			const colsB = mapB.get(title)!

			// Handle multiple collections with same title
			// For each collection in A, check if it exists in B
			for (const colA of colsA) {
				let foundMatch = false

				for (const colB of colsB) {
					// Compare by hash
					const hashA = colA.hash
					const hashB = colB.hash

					if (hashA === hashB) {
						// Hashes match, keep one (prefer B as it's from local storage)
						sameCollections.push(colB)
						foundMatch = true
						break
					}
				}

				// If no match found, add collection A (it's from imported data)
				if (!foundMatch) {
					conflictCollectionsA.push(colA)
				}
			}

			// Add collections from B that weren't matched with A
			for (const colB of colsB) {
				const existsInResult = sameCollections.some((c) => c.id === colB.id)
				if (!existsInResult) {
					conflictCollectionsB.push(colB)
				}
			}
		} else if (hasA) {
			// Only in A - add all collections with this title
			const colsA = mapA.get(title)!
			conflictCollectionsA.push(...colsA)
		} else if (hasB) {
			// Only in B - add all collections with this title
			const colsB = mapB.get(title)!
			conflictCollectionsB.push(...colsB)
		}
	}

	// 2. Handle collections without titles (empty string, undefined, null)
	// Incremental processing, all kept, user can delete manually
	const filterUntitled = (collections: any[]) => {
		return collections.filter((col) => !col.title)
	}

	const untitledA = filterUntitled(collections1)
	const untitledB = filterUntitled(collections2)

	// Hash -> collection for untitled collections
	const hashMapA = new Map<string, any>()
	const hashMapB = new Map<string, any>()

	const addToHashMap = async (collections: any[], hashMap) => {
		for (const col of collections) {
			const hash = await hashCollection(col)
			hashMap.set(hash as string, col)
		}
	}

	await Promise.all([
		addToHashMap(untitledA, hashMapA),
		addToHashMap(untitledB, hashMapB),
	])

	// Add all unique untitled collections
	for (const col of hashMapA.values()) {
		conflictCollectionsA.push(col)
	}
	for (const col of hashMapB.values()) {
		conflictCollectionsB.push(col)
	}

	// console.log("compare finished (improved)", mergedCollections)
	return { sameCollections, conflictCollectionsA, conflictCollectionsB }
}
