import ExportSvg from "@/assets/svg/export.svg?react"
import ImportSvg from "@/assets/svg/import.svg?react"
// import useExport from "@/hooks/useExport"
// import useImport from "@/hooks/useImport"
// import CloudFileSync from "./CloudFileSync"
import HeaderActionButtons from "./HeaderActionButtons"
import Icon from "./Icon"
// import LoadingBtn from "./LoadingBtn"
import { Search } from "./search/searchContext"
import { SettingsButton } from "./setting"
import { ThemeController } from "./Theme"
import { useGlobalCtxSelector } from "./data"

const Header = () => {
	const current = useGlobalCtxSelector((v) => v.current)
	// const { isImporting, execute } = useImport()
	// const { isExporting, exportData } = useExport()

	if (!current) return null

	return (
		<header className='bg-base-300 h-20 w-auto flex-none'>
			<div className='flex h-full w-full items-center p-4 sm:pr-2'>
				<Search />
				{/* 自动靠右排列   */}
				<ThemeController className='ml-auto hidden lg:flex' />
				{/* <LoadingBtn
					className='btn btn-ghost hidden lg:flex'
					onClick={exportData}
					loading={isExporting}
				>
					<Icon Svg={ExportSvg} />
					<span className='hidden lg:inline'>Export</span>
				</LoadingBtn> */}
				{/* <LoadingBtn
					className='btn btn-ghost hidden lg:flex'
					onClick={execute}
					loading={isImporting}
				>
					<Icon Svg={ImportSvg} />
					<span className='hidden lg:inline'>Import</span>
				</LoadingBtn> */}
				<SettingsButton className='btn-ghost hidden lg:flex' />
				{/* <HeaderActionButtons /> */}
				{/* <CloudFileSync /> */}
			</div>
		</header>
	)
}
export default Header
