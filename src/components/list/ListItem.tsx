import DragableIcon from "@/assets/svg/dragable.svg?react"
import Pinned from "@/assets/svg/pinned.svg?react"
import { jumptToTab, openTabs } from "@/utils/platform"
import { memo, useCallback, useMemo, useState, type FC } from "react"

import { useDndContext, useSortableItem } from "../Dnd"
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
				className='w-4 h-4'
				loading='lazy'
			/>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.url === nextProps.url
	}
)

const PinnedOrHandleIcon = ({ pinned, checked, attributes, listeners }) => {
	const className =
		"flex h-5 w-5 flex-none items-center justify-start" +
		(pinned ? "" : " list-item__handle")

	const Svg = pinned ? Pinned : DragableIcon
	const iconClassName = pinned
		? "h-full w-full outline-none hover:cursor-grab active:cursor-grabbing"
		: "h-full w-full fill-slate-300 outline-none hover:cursor-grab active:cursor-grabbing dark:fill-slate-600 " +
			"hidden group-hover:inline-flex " +
			// TODO: comptible with group-hover
			(checked ? "flex" : "hidden")

	return (
		<i className={className}>
			<Icon
				Svg={Svg}
				className={iconClassName}
				{...attributes}
				{...listeners}
			/>
		</i>
	)
}

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
	// const [isHovered, setIsHovered] = useState(false)
	const { settings } = useSettings() // TODO: dev, delete

	const onChange = useCallback(
		(e) => {
			onSelect({ tab, isSelected: !checked })
		},
		[onSelect, tab, checked]
	)
	// const onMouseOver = useCallback((e) => setIsHovered(true), [])
	// const onMouseLeave = useCallback((e) => setIsHovered(false), [])

	const handleClickUrl = useCallback(() => {
		console.log("on click url", type)

		if (type === "window") {
			// if current is window, jumpt to the target tab
			jumptToTab(tab)
		} else {
			// current is collection, open new tab
			openTabs(tab)
		}
	}, [type, tab])

	const className = useMemo(() => {
		return (
			"group flex flex-nowrap items-center py-1 overflow-hidden text-ellipsis whitespace-nowrap align-baseline text-base font-light hover:bg-slate-100 dark:hover:bg-slate-100" +
			(checked ? " bg-slate-100 dark:bg-slate-800" : "") +
			(jumped?.id === tab.id
				? " animate-once animate-duration-[2000ms] animate-ease-in-out animate-pulse bg-slate-100 dark:bg-slate-800"
				: "")
		)
	}, [checked, jumped?.id, tab.id])

	return (
		<li
			ref={setNodeRef}
			style={{
				...sortableStyle,
				// opacity: !overlay && draggingItem?.id === tab.id ? 0.5 : 1
			}}
			className={className}
			// TODO: delete
			// onMouseOver={onMouseOver}
			// onMouseLeave={onMouseLeave}
		>
			{/* TODO: perf */}
			<PinnedOrHandleIcon
				pinned={tab.pinned}
				checked={tab.checked}
				attributes={attributes}
				listeners={listeners}
			></PinnedOrHandleIcon>
			{/* <input
				type='checkbox'
				className='checkbox-primary checkbox checkbox-sm'
				checked={checked ?? false}
				onChange={onChange}
			/> */}
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
				{highlight(tab.title, query)}
			</span>
			<a
				className='link-hover link items-center overflow-hidden text-sm text-ellipsis whitespace-nowrap text-slate-400 dark:text-slate-500 hidden group-hover:inline-flex'
				title={tab.url}
				onClick={handleClickUrl}
			>
				{settings.dev && tab.id}
				{highlight(tab.url, query)}
			</a>
		</li>
	)
}

export default memo(ListItem)
