import Computer from "@/assets/svg/computer.svg?react"
import Copy from "@/assets/svg/copy.svg?react"
import Cross from "@/assets/svg/cross.svg?react"
import Delete from "@/assets/svg/delete.svg?react"
import Edit from "@/assets/svg/edit.svg?react"
import FolderPlus from "@/assets/svg/folder-plus.svg?react"
import Folder from "@/assets/svg/folder.svg?react"
import Logout from "@/assets/svg/logout.svg?react"
import More from "@/assets/svg/more.svg?react"
import Package from "@/assets/svg/package-add.svg?react"
import Paste from "@/assets/svg/paste.svg?react"
import Pin from "@/assets/svg/pin.svg?react"
import Unpin from "@/assets/svg/unpin.svg?react"
import { useOperationsContext } from "@/components/contexts/operationsContext"
import { CURRENT_WINDOW } from "@/utils/platform"
import { FC, useCallback, useMemo } from "react"

import { useGlobalCtx } from "./contexts/context"
import Dropdown from "./Dropdown"
import Icon from "./Icon"
import { useGlobalCtxSelector } from "./data"

type CollectionActionButtonsProps = {
	collection: Collection
}
export const CollectoinActionButtons: FC<CollectionActionButtonsProps> = ({
	collection,
}) => {
	const {
		openCollection,
		pinnedCollection,
		deleteCollection,
		activeTitleInput,
		copy,
		paste,
		clone,
	} = useOperationsContext()

	const pinCollection = useCallback(() => {
		pinnedCollection(collection)
	}, [collection])

	const collectionMenu = useMemo(() => {
		return [
			{
				text: collection.pinned ? "unpin" : "pin",
				icon: <Icon Svg={collection.pinned ? Unpin : Pin} />,
				callback: pinCollection,
				includes: ["collection"],
			},
			{
				text: "edit title",
				icon: <Icon Svg={Edit} />,
				// callback: activeTitleInput(inputRef), // TODO: select item to the current, activiate the inputRef
				includes: ["collection"],
			},
			{
				text: "open collection",
				icon: <Icon Svg={Computer} />,
				callback: openCollection,
				includes: ["collection"],
			},
			{
				text: "delete collection",
				icon: (
					<Icon
						Svg={Delete}
						type='warn'
					/>
				),
				callback: deleteCollection,
				includes: ["collection"],
				warn: true,
			},
			{
				text: "clone",
				icon: <Icon Svg={Package} />,
				callback: clone,
				includes: ["collection"],
			},
		]
	}, [collection])

	const warnClassName = "text-red-500 fill-red-500"

	return (
		<>
			{collectionMenu.map((item) => {
				// close Dropdown
				const cb = item.callback
				item.callback = () => {
					document.activeElement instanceof HTMLElement &&
						document.activeElement.blur() // close Dropdown
					setTimeout(cb, 100) // delay trigger for Dropdown close first
				}
				return (
					<li
						key={item.text}
						className={`${item.disabled ? "disabled" : ""} ${item.warn ? warnClassName : ""}`}
					>
						<a onClick={item.callback}>
							{item.icon}
							{item.text}
						</a>
					</li>
				)
			})}
		</>
	)
}

type DropDownActionButtonProps = {
	className: string
	inputRef?: any
	position?: "start" | "center" | "end"
}
const DropDownActionButton: FC<DropDownActionButtonProps> = ({
	className,
	inputRef,
	position,
}) => {
	const {
		current,
		type,
		state: { collections },
	} = useGlobalCtxSelector((v) => v)
	const { selectedList, tabsByWindowMap } = useOperationsContext()
	const {
		goToWindow,
		deleteWindow,
		openCollection,
		pinnedCollection,
		saveCurrentToCollection,
		deleteCollection,
		activeTitleInput,
		openChooseCollectionDialog,
		copy,
		paste,
		clone,
	} = useOperationsContext()

	const warnClassName = "text-red-500 fill-red-500"
	const isCurrentWindow = current.id === CURRENT_WINDOW.id

	const windowMenu = useMemo(() => {
		return [
			{
				text: "go to window",
				icon: (
					<Icon
						Svg={Logout}
						type={isCurrentWindow ? "disabled" : undefined}
					/>
				),
				callback: goToWindow,
				disabled: isCurrentWindow,
				includes: ["window"],
			},
			{
				text: "save as new collection",
				icon: <Icon Svg={FolderPlus} />,
				callback: () => saveCurrentToCollection(),
				includes: ["window"],
			},
			{
				text: "save to collection",
				icon: <Icon Svg={Folder} />,
				callback: openChooseCollectionDialog,
				includes: ["window"],
			},
			{
				text: "close window",
				icon: (
					<Icon
						Svg={Cross}
						type='warn'
					/>
				),
				callback: deleteWindow,
				includes: ["window"],
				warn: true,
			},
		]
	}, [isCurrentWindow])

	const collectionMenu = useMemo(() => {
		return [
			{
				text: current.pinned ? "unpin" : "pin",
				icon: <Icon Svg={Pin} />,
				callback: pinnedCollection,
				includes: ["collection"],
			},
			{
				text: "edit title",
				icon: <Icon Svg={Edit} />,
				callback: activeTitleInput(inputRef),
				includes: ["collection"],
			},
			{
				text: "open collection",
				icon: <Icon Svg={Computer} />,
				callback: openCollection,
				includes: ["collection"],
			},
			{
				text: "delete collection",
				icon: (
					<Icon
						Svg={Delete}
						type='warn'
					/>
				),
				callback: deleteCollection,
				includes: ["collection"],
				warn: true,
			},
		]
	}, [current, collections])

	const selectedMenu = useMemo(() => {
		let copyText = "copy"
		let copyItem = { value: current, type: type }
		if (selectedList?.length) {
			copyText = "copy selected"
			copyItem = { value: selectedList, type: "tab" }
			if (tabsByWindowMap.size === 1) {
				const [[windowId, tabs]] = tabsByWindowMap.entries()
				const window =
					type === "window"
						? current
						: current.windows.find((w) => w.id === windowId)
				if (window && tabs?.length === window.tabs.length) {
					copyText = "copy window"
					copyItem = { value: window, type: "window" }
				}
			}
		}

		return [
			{
				text: copyText,
				icon: <Icon Svg={Copy} />,
				callback: () => copy(copyItem),
			},
			// TODO: enhance: if clipboard is empty, disabled
			{
				text: "paste",
				icon: <Icon Svg={Paste} />,
				callback: () => paste(current),
			},
			{
				text: "clone",
				icon: <Icon Svg={Package} />,
				callback: clone,
				includes: ["collection"],
			},
		]
	}, [selectedList])

	const menuList: any[] = useMemo(() => {
		const separator = { separator: true, key: "selected-tabs" }
		const menu =
			type === "window"
				? [
						...windowMenu,
						separator,
						...selectedMenu.filter(
							(item) => !item.includes || item.includes.includes("window")
						),
					]
				: [...collectionMenu, separator, ...selectedMenu]
		return menu
	}, [collectionMenu, windowMenu, selectedMenu])

	return (
		<>
			<Dropdown
				position={position ?? "end"}
				dropdownButton={
					<div
						role='button'
						className={className}
					>
						<Icon Svg={More} />
					</div>
				}
			>
				{/* // TODO: delete */}
				{/* <li className="menu-title">Window</li> */}
				{menuList.map((item) => {
					if (item.separator) {
						return (
							<li
								className='h-0.5 border-b-[1px] border-gray-300'
								key={item.key}
							></li>
						)
					}
					// close Dropdown
					const cb = item.callback
					item.callback = () => {
						document.activeElement instanceof HTMLElement &&
							document.activeElement.blur() // close Dropdown
						setTimeout(cb, 100) // delay trigger for Dropdown close first
					}
					return (
						<li
							key={item.text}
							className={`${item.disabled ? "disabled" : ""} ${item.warn ? warnClassName : ""}`}
						>
							<a onClick={item.callback}>
								{item.icon}
								{item.text}
							</a>
						</li>
					)
				})}
			</Dropdown>
		</>
	)
}

export default DropDownActionButton
