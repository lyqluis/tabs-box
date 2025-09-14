import { CURRENT_WINDOW } from "@/assets/mock/windows" // TODO: replace
import { fromNow } from "@/utils"
import { memo, useCallback, useMemo } from "react"
import { List } from "./list"
import { Sortable } from "./dnd"
import { useGlobalCtxSelector, type CurrentType } from "./data/context2"
import CopyIcon from "@/assets/svg/copy.svg?react"
import DeleteIcon from "@/assets/svg/delete.svg?react"
import MoveIcon from "@/assets/svg/share-folder.svg?react"
import ShareIcon from "@/assets/svg/share.svg?react"
import { useOperationsContext } from "@/components/operations/operationsContext"
import Icon from "./Icon"
import useDropdown from "@/hooks/useDropdown"

const ContentLayout = memo(({ header, children }) => (
	<div className='flex flex-auto flex-col overflow-hidden'>
		{header}
		<div className='scrollbar relative flex-auto overflow-y-scroll'>
			<div className='right-mask relative overflow-hidden'>{children}</div>
		</div>
	</div>
))

const ContentHeader = memo(({ current, type, collections }) => {
	const allTabsNumber = useMemo(
		() =>
			type === "collection"
				? current.windows.reduce((n, window) => (n += window.tabs.length), 0)
				: current.tabs.length,
		[type, current]
	)
	const windows = useGlobalCtxSelector((v) => v.state.windows)

	return (
		<>
			<div className='flex flex-none justify-between px-5 pt-8 pb-0'>
				{/* 1. title */}
				<Title
					current={current}
					type={type}
				/>
				{/* 2. collection operations */}
				<CollectionOperations
					current={current}
					type={type}
					windows={windows}
          collections={collections}
				/>
			</div>
			{/* 3. selected operations */}
			<SelectedOperations
				current={current}
				collections={collections}
				type={type}
			/>
		</>
	)
})

const Title = memo(
	({
		current,
		type,
		allTabsNumber,
	}: {
		current: Window | Collection
		type: CurrentType
		allTabsNumber: number
	}) => {
		return (
			<div className='flex min-w-1 flex-1 items-center'>
				<div className='avatar avatar-placeholder flex-none shrink-0 grow-0'>
					<div className='bg-neutral text-neutral-content w-12 rounded-full'>
						<span className='text-xl'>
							{/* TODO: type is window, use window icon, type is incogito window, use secret icon */}
							{current.title && current.title[0].toUpperCase()}
						</span>
					</div>
				</div>
				<div className='m-2 min-w-1 flex-initial'>
					{/* <TitleInput
					ref={inputRef}
					title={current.title ?? (isCurrentWindow ? "This Window" : "Window")}
					disable={type === "window"}
					// setTitle={setCollectionTitle}
				></TitleInput> */}
					{/* {CollectionTitle} */}
					<p className='my-2'>
						<span>{allTabsNumber} tabs</span> | Updated{" "}
						{fromNow(current.updated)}
					</p>
				</div>
			</div>
		)
	}
)

// TODO:
// - collection operations
// - selected operations
const CollectionOperations = memo(
	({
		windows,
    collections,
		current,
		type,
	}: {
		windows: Window[]
    collections: Collection[]
		current: Window | Collection
		type: CurrentType
	}) => {
		const isCurrentWindow = current.id === CURRENT_WINDOW.id
		const {
			Dropdown: SaveDropdown,
			toggleRef: SaveToggleRef,
			handleToggle: handleSaveToggle,
		} = useDropdown()

		return (
			<div className='flex items-center space-x-2'>
				{/* go to */}
				{type === "window" && windows.length > 1 && !isCurrentWindow && (
					<button
						className='btn btn-outline btn-primary hidden p-2 sm:block'
						// onClick={goToWindow}
					>
						go to
					</button>
				)}
				{/* open */}
				{type === "collection" ? (
					<button
						className='btn btn-outline btn-primary hidden p-2 sm:block'
						// onClick={openCollection}
					>
						open
					</button>
				) : (
					// save
					<div className='join join-vertical lg:join-horizontal hidden lg:block'>
						<button
							className='btn btn-outline btn-primary join-item p-2'
							// onClick={() => saveCurrentToCollection()}
						>
							save as new collection
						</button>
						<button
							ref={SaveToggleRef}
							className='btn btn-outline btn-primary join-item p-2'
							onClick={() => handleSaveToggle()}
						>
							save to collection
						</button>
						<SaveDropdown>
							{collections.map((collection) => (
								<li
									// onClick={() => saveCurrentToCollection(collection)}
									key={collection.id}
								>
									<a>{collection.title}</a>
								</li>
							))}
						</SaveDropdown>
					</div>
				)}
				{/* delete */}
				<button
					className='btn btn-outline btn-primary hidden p-2 sm:block'
					onClick={deleteWindowOrCollection}
				>
					{type === "window" ? "close" : "delete"}
				</button>
				{/* // TODO: responsiable in small window, buttons shrink to be one */}
				{/* actions in small screen */}
				{/* <DropDownActionButton
						inputRef={inputRef}
						// ? hidden in large screen
						// className="btn block p-2 lg:hidden"
						className='btn block p-2'
					></DropDownActionButton> */}
				{/* refresh */}
				<RefreshBtn></RefreshBtn>
			</div>
		)
	}
)

const SelectedOperations = ({
	current,
	collections,
	type,
	selectedList,
	allTabsNumber,
}: {
	current: Window | Collection
	collections: Collection[]
	type: CurrentType
	selectedList: Tab[]
	allTabsNumber: number
}) => {
	const {
		Dropdown: MoveSelectedDropdown,
		toggleRef: moveSelectedToggleRef,
		handleToggle: handleMoveSelectedToggle,
	} = useDropdown({ menuPosition: "right" })
	const {
		tabsByWindowMap,
		setSelectedList,
		openSelected,
		deleteSelected,
		addSelectedToCollection,
		copy,
	} = useOperationsContext()

	const cancelAllSelected = (e: MouseEvent<HTMLDivElement>) => {
		const contentNode = ContentLayoutRef.current
		const outsideNodes = [
			contentNode.children[0],
			// contentNode.children[1], // selected actions
			contentNode.children[2], // windows
			contentNode.children[2].children[0],
		]
		if (outsideNodes.includes(e.target)) {
			setSelectedList([])
		}
	}

	// selected actions
	const selectAllInCollection = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			// select all
			const windows = current?.windows ?? [current] // current maybe collection or single window
			const tabs = windows.reduce((tabs, window) => {
				return [...tabs, ...window.tabs]
			}, [])
			// setSelectedList(tabs)
		} else {
			// remove all
			// setSelectedList([])
		}
	}

	const copySelected = useCallback(() => {
		let copyType: "tab" | "window" | "collection" = "tab"
		if (selectedList.length === allTabsNumber) copyType = "collection"
		if (tabsByWindowMap.size === 1) {
			const [[windowId, tabs]] = tabsByWindowMap.entries()
			const window =
				type === "window"
					? current
					: current.windows.find((w) => w.id === windowId)
			if (window && tabs?.length === window.tabs.length) {
				copyType = "window"
			}
		}
		copy({ value: selectedList, type: copyType })
	}, [selectedList, copy])

	return (
		<div
			className={
				"btn-wrapper bg-base-300 mx-5 flex flex-none justify-between rounded-md px-5 py-1"
			}
		>
			<div className='flex'>
				<label className='label cursor-pointer'>
					<input
						type='checkbox'
						className='checkbox-primary checkbox checkbox-sm'
						checked={selectedList.length === allTabsNumber}
						onChange={selectAllInCollection}
					/>
					<span className='text-base-content text-sm'>Select All</span>
				</label>
				<p className='mx-2 flex items-center'>
					{selectedList.length > 0 && (
						<span>
							{selectedList.length} selected | {allTabsNumber} tabs
						</span>
					)}
				</p>
			</div>
			<div>
				{/* open */}
				{type === "collection" && (
					<div
						className='tooltip'
						data-tip='open selected'
					>
						<button
							className='btn btn-xs m-1'
							onClick={openSelected}
							disabled={!selectedList.length}
						>
							<Icon
								Svg={ShareIcon}
								width={4}
								height={4}
							/>
						</button>
					</div>
				)}
				{/* copy */}
				<div
					className='tooltip'
					data-tip='copy selected'
				>
					<button
						className='btn btn-xs m-1'
						disabled={!selectedList.length}
						onClick={copySelected}
					>
						<Icon
							Svg={CopyIcon}
							width={4}
							height={4}
						/>
					</button>
				</div>
				{/* delete */}
				<div
					className='tooltip'
					data-tip={
						type === "collection" ? "delete selected" : "close selected"
					}
				>
					<button
						className='btn btn-xs m-1'
						onClick={deleteSelected}
						disabled={!selectedList.length}
					>
						<Icon
							Svg={DeleteIcon}
							width={4}
							height={4}
						/>
					</button>
				</div>
				{/* move */}
				<div
					className='tooltip'
					data-tip='move selected'
				>
					<button
						ref={moveSelectedToggleRef}
						className='btn btn-xs m-1'
						disabled={!selectedList.length}
						onClick={() => handleMoveSelectedToggle()}
					>
						<Icon
							Svg={MoveIcon}
							width={4}
							height={4}
						/>
					</button>
				</div>
				<MoveSelectedDropdown>
					{collections
						.filter((c) => c.id !== current.id)
						.map((collection) => (
							<li
								onClick={() => addSelectedToCollection(collection.id)}
								key={collection.id}
							>
								<a>{collection.title}</a>
							</li>
						))}
				</MoveSelectedDropdown>
			</div>
		</div>
	)
}

const ContentBody = memo(
	({ current, type, onSelect, tabsByWindowMap, setTabsByWindow }) => {
		if (current.tabs) {
			return (
				<List
					window={current}
					type={type}
					onSelect={onSelect}
					selectedMap={tabsByWindowMap}
					setWindowTabs={setTabsByWindow}
				></List>
			)
		}

		return (
			<Sortable
				list={current.windows}
				listId={current.id}
			>
				{current.windows.map((window) => (
					<List
						key={window.id}
						window={window}
						type={type}
						onSelect={onSelect}
						selectedMap={tabsByWindowMap}
						setWindowTabs={setTabsByWindow}
					></List>
				))}
			</Sortable>
		)
	}
)

const Content = () => {
	const current = useGlobalCtxSelector((v) => v.current)
	const collections = useGlobalCtxSelector((v) => v.state.collections)
	const type = useGlobalCtxSelector((v) => v.type)
	const { selectedList, tabsByWindowMap, onSelect, setTabsByWindow } =
		useOperationsContext()

	if (!current) return <h1>loading</h1>

	return (
		<ContentLayout
			header={
				<ContentHeader
					current={current}
					type={type}
					collections={collections}
				/>
			}
		>
			<ContentBody
				current={current}
				type={type}
				onSelect={onSelect}
				tabsByWindowMap={tabsByWindowMap}
				setTabsByWindow={setTabsByWindow}
			/>
		</ContentLayout>
	)
}

export default memo(Content)
