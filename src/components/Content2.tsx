import { CURRENT_WINDOW } from "@/assets/mock/windows" // TODO: replace
import { fromNow } from "@/utils"
import { memo, useMemo } from "react"
import { List } from "./list"
import { Sortable } from "./Dnd"
// import { useGlobalCtx } from "./contexts/context"
import { useGlobalCtxSelector } from "./contexts/data/context2"
import { useOperationsContext } from "./contexts/operationsContext"

const ContentLayout = memo(({ header, children }) => (
	<div className='flex flex-auto flex-col overflow-hidden'>
		<div className='flex flex-none justify-between px-5 pt-8 pb-0'>
			{header}
		</div>
		<div className='scrollbar relative flex-auto overflow-y-scroll'>
			<div className='right-mask relative overflow-hidden'>{children}</div>
		</div>
	</div>
))

const ContentHeader = memo(({ current, type, collections }) => {
	return (
		// 1. title
		// 2. collection operations
		// 3. selected operations
		<>
			<Title
				current={current}
				type={type}
			/>
		</>
	)
})

const Title = memo(({ current, type }) => {
	const allTabsNumber = useMemo(
		() =>
			type === "collection"
				? current.windows.reduce((n, window) => (n += window.tabs.length), 0)
				: current.tabs.length,
		[type, current]
	)

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
					<span>{allTabsNumber} tabs</span> | Updated {fromNow(current.updated)}
				</p>
			</div>
		</div>
	)
})

// TODO:
// - collection operations
// - selected operations
const CollectionOperations = memo(({ windows, current, type }) => {
	const isCurrentWindow = current.id === CURRENT_WINDOW.id

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
})

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
