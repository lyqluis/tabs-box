import DragableIcon from "@/assets/svg/dragable.svg?react"
import Pinned from "@/assets/svg/pinned.svg?react"
import { jumptToTab, openTabs } from "@/utils/platform"
import { memo, useState, type FC } from "react"

import { useDndContext, useSortableItem } from "../dnd"
import Icon from "../Icon"
import { highlight, useSearchCtx } from "../search/searchContext"
import { useSettings } from "../setting/settingContext"

// Memoized Favicon component to prevent re-rendering when url is the same
const Favicon = memo(
	({ url }: { url: string }) => {
		return (
			<img
				src={url}
				alt=''
				className='w-4'
			/>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.url === nextProps.url
	}
)

interface ListItemProps {
	tab: Tab
	checked: boolean
	type: "window" | "collection"
	overlay?: boolean
	onSelect?: (props) => void
}

const ListItem: FC<ListItemProps> = ({
	tab,
	type,
	onSelect,
	overlay,
	checked,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		style: sortableStyle,
	} = useSortableItem({
		id: tab.id,
	})
	// const { draggingItem } = useDndContext()
	const { query, jumped } = useSearchCtx()
	const [isHovered, setIsHovered] = useState(false)
	const { settings } = useSettings() // TODO: dev, delete

	const onChange = (e) => {
		onSelect({ tab, isSelected: !checked })
	}
	const onMouseOver = (e) => setIsHovered(true)
	const onMouseLeave = (e) => setIsHovered(false)

	const handleClickUrl = (tab) => {
		console.log("on click url", type)

		if (type === "window") {
			// if current is window, jumpt to the target tab
			jumptToTab(tab)
		} else {
			// current is collection, open new tab
			openTabs(tab)
		}
	}

	const className =
		"flex flex-nowrap items-center py-1 overflow-hidden text-ellipsis whitespace-nowrap align-baseline text-base font-light hover:bg-slate-100 dark:hover:bg-slate-800" +
		(checked ? " bg-slate-100 dark:bg-slate-800" : "") +
		(jumped?.id === tab.id
			? " animate-once animate-duration-[2000ms] animate-ease-in-out animate-pulse bg-slate-100 dark:bg-slate-800"
			: "")

	return (
		<li
			className={className}
		>
			<Favicon url={tab.favIconUrl} />
			<span
				className={`mr-2 flex-none ${tab.status === "loading" ? "text-gray-500" : ""}`}
			>
				{highlight(tab.title, query)}
				{/* {tab.title} */}
			</span>
			<a
				className='link-hover link items-center overflow-hidden text-sm text-ellipsis whitespace-nowrap text-slate-400 dark:text-slate-500'
				title={tab.url}
				onClick={() => handleClickUrl(tab)}
			>
				{settings.dev && tab.id}
				{highlight(tab.url, query)}
				{/* {tab.url} */}
			</a>
		</li>
	)

	return (
		<li
			ref={setNodeRef}
			style={{
				...sortableStyle,
				// opacity: !overlay && draggingItem?.id === tab.id ? 0.5 : 1
			}}
			className={className}
			onMouseOver={onMouseOver}
			onMouseLeave={onMouseLeave}
		>
			<i
				className={
					"flex h-5 w-5 flex-none items-center justify-start" +
					(tab.pinned ? "" : " list-item__handle")
				}
			>
				{tab.pinned ? (
					<Icon
						Svg={Pinned}
						className={
							"h-full w-full outline-none hover:cursor-grab active:cursor-grabbing"
						}
						{...attributes}
						{...listeners}
					/>
				) : (
					<Icon
						Svg={DragableIcon}
						className={
							"h-full w-full fill-slate-300 outline-none hover:cursor-grab active:cursor-grabbing dark:fill-slate-600 " +
							(isHovered || checked ? "flex" : "hidden")
						}
						{...attributes}
						{...listeners}
					/>
				)}
			</i>
			<input
				type='checkbox'
				className='checkbox-primary checkbox checkbox-sm'
				checked={checked ?? false}
				onChange={onChange}
			/>
			<span className='m-0.5 flex w-6 flex-none items-center justify-center'>
				{type === "window" && tab.status === "loading" ? (
					<span className='loading loading-spinner loading-sm text-gray-500'></span>
				) : (
					<Favicon url={tab.favIconUrl} />
				)}
			</span>
			<span
				className={`mr-2 flex-none ${tab.status === "loading" ? "text-gray-500" : ""}`}
			>
				{/* {highlight(tab.title, query)} */}
				{tab.title}
			</span>
			{isHovered && (
				<a
					className='link-hover link items-center overflow-hidden text-sm text-ellipsis whitespace-nowrap text-slate-400 dark:text-slate-500'
					title={tab.url}
					onClick={() => handleClickUrl(tab)}
				>
					{settings.dev && tab.id}
					{/* {highlight(tab.url, query)} */}
					{tab.url}
				</a>
			)}
		</li>
	)
}

export default memo(ListItem)
