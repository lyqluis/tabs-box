import More from "@/assets/svg/more.svg?react"
import Pinned from "@/assets/svg/pinned.svg?react"
import TopSvg from "@/assets/svg/top.svg?react"
import useDropdown from "@/hooks/useDropdown"
import useScroll from "@/hooks/useScroll"
import { fromNow, shortURL } from "@/utils"
import { useTabEvents, useWindowEvents } from "@/utils/platform"
import { memo, useEffect, useMemo, useTransition } from "react"

import { CollectoinActionButtons } from "./CollectionButtons"
// import { useGlobalCtx } from "./contexts/context"
import { useGlobalCtxSelector } from "./data/context2"
import { Droppable } from "./dnd"
import Icon from "./Icon"
import { setCurrentId } from "./data/actions"
import { highlight, useSearchCtx } from "./search/searchContext"

const SideBarItem = ({ item, isSelected, onSelect }) => {
	const type = item.created ? "collection" : "window"
	// const { query } = useSearchCtx()
	const {
		Dropdown: SideBarItemDropdown,
		toggleRef: sidebarItemToggleRef,
		handleToggle,
	} = useDropdown()

	let itemContent
	if (type === "window") {
		itemContent = (
			<>
				<p className='flex items-center justify-between overflow-hidden leading-tight text-ellipsis whitespace-nowrap'>
					{/* // TODO: {current.id === window.id ? "Current" : "Window"} */}
					Window
				</p>
				<p className='overflow-hidden text-xs font-extralight text-ellipsis whitespace-nowrap italic'>
					<span>{shortURL(item?.tabs?.find((tab) => !tab.pinned)?.url)}</span>
				</p>
				<p className='text-xs font-light'>{item?.tabs?.length + " tabs"}</p>
			</>
		)
	} else {
		// type is collection
		itemContent = (
			<>
				<p className='flex items-center justify-between overflow-hidden leading-tight'>
					{/* TODO: if item.隐身模式，font color grey */}
					<span className='overflow-hidden text-ellipsis whitespace-nowrap'>
						{/* {highlight(item.title, query) ?? "Window"} */}
						{item.title ?? "Window"}
					</span>
					{item.pinned ? (
						<Icon
							Svg={Pinned}
							className={
								"flex h-5 w-5 flex-none items-center justify-start " +
								(isSelected ? "fill-primary-content" : "fill-base-content")
							}
						/>
					) : null}
				</p>
				<p className='text-xs font-light'>Updated {fromNow(item.updated)}</p>
			</>
		)
	}

	return (
		<Droppable
			item={item}
			className='mb-2.5 rounded-md'
		>
			<div
				className={
					"group hover:bg-primary hover:text-primary-content flex h-20 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-md p-3.5 shadow-md" +
					(isSelected
						? " bg-primary text-primary-content font-semibold"
						: " bg-base-100 text-base-content font-normal")
				}
				onClick={() => onSelect(item)}
				data-id={item.id}
			>
				{itemContent}
				{/* TODO: */}
				<div className='absolute top-0 right-2 bottom-0 flex items-center'>
					{/* group-hover:flex */}
					{/* <DropDownActionButton
						className='btn btn-circle btn-ghost'
						position='start'
					/> */}
					<div
						role='button'
						ref={sidebarItemToggleRef}
						className='btn btn-ghost btn-circle'
						onClick={(e) => {
							e.stopPropagation()
							handleToggle()
						}}
					>
						<Icon Svg={More} />
					</div>
					<SideBarItemDropdown>
						<CollectoinActionButtons collection={item} />
					</SideBarItemDropdown>
				</div>
			</div>
		</Droppable>
	)
}

const SideBar = ({}) => {
	const windows = useGlobalCtxSelector((v) => v.state.windows)
	const collections = useGlobalCtxSelector((v) => v.state.collections)
	const currentId = useGlobalCtxSelector((v) => v.state.currentId)
	const type = useGlobalCtxSelector((v) => v.type)
	const current = useGlobalCtxSelector((v) => v.current)
	const dispatch = useGlobalCtxSelector((v) => v.dispatch)

	const {
		scrollRef: windowListRef,
		isOverflowTop: isOverflowTopWindowList,
		isOverflowBottom: isOverflowBottomWindowList,
	} = useScroll()
	const {
		scrollRef,
		scrollElement,
		isOverflowTop,
		isOverflowBottom,
		scrollToTop,
		scrollTo,
	} = useScroll()

	// useTabEvents()
	// useWindowEvents()

	const onSelect = async (windowOrCollection) => {
		console.log("sidebar select item", windowOrCollection)
		dispatch(setCurrentId(windowOrCollection.id))
		// dispatch(setCurrent(windowOrCollection)) // TODO: delete, useless for perf
	}

	const [pinnedCollections, unPinnedCollections]: [Collection[], Collection[]] =
		useMemo(
			() =>
				collections.reduce(
					(acc, item) => {
						acc[item.pinned ? 0 : 1].push(item)
						return acc
					},
					[[], []]
				),
			[collections]
		)

	// useEffect(() => {
	// 	if (current && type === "collection" && !current.pinned) {
	// 		// 1. get target item id
	// 		const id = current.id
	// 		// 2. get target item element via id
	// 		const targetElement = scrollElement?.querySelector(`[data-id="${id}"]`)
	// 		// 3. check if the element is within the visible area
	// 		const containerRect = scrollElement?.getBoundingClientRect()
	// 		const elementRect = targetElement?.getBoundingClientRect()
	// 		const isVisible =
	// 			elementRect.top >= containerRect.top &&
	// 			elementRect.bottom <= containerRect.bottom

	// 		if (!isVisible) {
	// 			// caculate the scroll top
	// 			const offset = 10
	// 			const targetTop =
	// 				scrollElement.scrollTop +
	// 				(elementRect.top - containerRect.top) -
	// 				offset
	// 			scrollTo(targetTop)
	// 		}
	// 	}
	// }, [current])

	if (!current) return <>loading</>

	return (
		<aside className='from-base-200 to-base-300 text-base-content flex h-screen w-1/3 min-w-52 flex-col bg-gradient-to-b from-80% pl-3.5 text-base font-medium'>
			<div className='my-2 mr-5 flex justify-between'>
				<p>windows</p>
			</div>
			<ul
				ref={windowListRef}
				className={
					"scrollbar scroll-container max-h-60 flex-none overflow-y-scroll pr-[0.625rem]" +
					(isOverflowTopWindowList ? " top-shadow" : "") +
					(isOverflowBottomWindowList ? " bottom-shadow" : "")
				}
			>
				{windows.map((window) => (
					<SideBarItem
						key={window.id}
						item={window}
						// isSelected={window.id === current.id}
						isSelected={window.id === currentId}
						onSelect={onSelect}
					></SideBarItem>
				))}
			</ul>
			<div className='mr-5 mb-2 flex justify-between'>
				<p>collections ({collections.length})</p>
				{isOverflowTop ? (
					<button
						className='btn btn-circle btn-xs'
						onClick={scrollToTop}
					>
						<Icon Svg={TopSvg} />
					</button>
				) : null}
			</div>
			{/* sticky the pinned item */}
			<ul className='flex-grow pr-3.5'>
				{pinnedCollections.map((collection) => (
					<SideBarItem
						key={collection.id}
						item={collection}
						// isSelected={collection.id === current.id}
						isSelected={collection.id === currentId}
						onSelect={onSelect}
					></SideBarItem>
				))}
			</ul>
			<ul
				ref={scrollRef}
				className={
					"scrollbar scroll-container flex-grow overflow-y-scroll pr-3.5" +
					(isOverflowTop ? " top-shadow" : "") +
					(isOverflowBottom ? " bottom-shadow" : "")
				}
			>
				{unPinnedCollections.map((collection) => (
					<SideBarItem
						key={collection.id}
						item={collection}
						// isSelected={collection.id === current.id}
						isSelected={collection.id === currentId}
						onSelect={onSelect}
					></SideBarItem>
				))}
			</ul>
		</aside>
	)
}

export default memo(SideBar)
