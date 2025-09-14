import ExportSvg from "@/assets/svg/export.svg?react"
import ImportSvg from "@/assets/svg/import.svg?react"
import SettingSvg from "@/assets/svg/setting.svg?react"
import useExport from "@/hooks/useExport"
import useImport from "@/hooks/useImport"
import { useCallback } from "react"

import { useDev } from "./dev"
import Dropdown from "./Dropdown"
import Icon from "./Icon"
import { SettingsButton } from "./setting"

const HeaderActionButtons = () => {
	const { execute } = useImport()
	const { exportData } = useExport()

	const { resetAllCollections, resetSyncBaseData } = useDev() // TODO: delete

	const closeDropdown = useCallback(() => {
		document.activeElement.blur()
	}, [])

	const closeDropdownWrapper = useCallback(
		(callback) => {
			return () => {
				closeDropdown()
				callback()
			}
		},
		[closeDropdown]
	)
	const liClassName = "btn-ghost p-0 px-1 justify-start"

	return (
		<Dropdown
			className='ml-auto lg:hidden'
			position='end'
			dropdownButton={
				<button className='btn'>
					<Icon Svg={SettingSvg} />
				</button>
			}
		>
			<li>
				<SettingsButton className={liClassName} />
			</li>
			<li>
				<button
					className={"btn " + liClassName}
					onClick={closeDropdownWrapper(execute)}
				>
					<Icon Svg={ImportSvg} />
					<span>Import</span>
				</button>
			</li>
			<li>
				<button
					className={"btn " + liClassName}
					onClick={closeDropdownWrapper(exportData)}
				>
					<Icon Svg={ExportSvg} />
					<span>Export</span>
				</button>
			</li>

			{/* TODO: delete below */}
			<li>
				<button
					className={"btn " + liClassName}
					onClick={closeDropdownWrapper(resetAllCollections)}
				>
					<span>clear collections</span>
				</button>
			</li>
			<li>
				<button
					className={"btn " + liClassName}
					onClick={closeDropdownWrapper(resetSyncBaseData)}
				>
					<span>clear local base collection data</span>
				</button>
			</li>
		</Dropdown>
	)
}

export default HeaderActionButtons
