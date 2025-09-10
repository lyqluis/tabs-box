// TODO: finish setting function
import { useCallback, useState } from "react"
import Dropdown from "../Dropdown"
import { ThemeControllerIconInside } from "../Theme"
import { LANGUAGE_OPTIONS, SETTING_TEXT, useSettings } from "./settingContext"
import Modal from "../Modal"
import Icon from "../Icon"
import ToolsSvg from "@/assets/svg/tools.svg?react"

// 6. 创建设置界面组件
const BooleanSetting = ({ field, name, value }) => {
	const { settings, updateSettings } = useSettings()
	return (
		<div className='flex w-full items-center justify-between'>
			<label className='label'>
				<span className='label-text'>
					{SETTING_TEXT[name][settings.language] ?? name}
				</span>
			</label>

			<input
				type='checkbox'
				className='toggle toggle-primary border-primary'
				checked={value}
				onChange={() => {
					const newSetting = field
						? { [field]: { ...settings[field], [name]: !value } }
						: { [name]: !value }
					updateSettings(newSetting)
				}}
			/>
		</div>
	)
}

const FieldSettings = ({ name, value }) => {
	const { settings } = useSettings()
	return (
		<>
			<div className='flex w-full flex-col justify-between'>
				<h3 className='text-sm font-semibold'>
					{SETTING_TEXT[name][settings.language]}
				</h3>
				{Object.entries(value).map(([subName, subValue]) => {
					return (
						<SettingTypeRenderer
							key={subName}
							field={name}
							name={subName}
							value={subValue}
						/>
					)
				})}
			</div>
		</>
	)
}

const ThemeSetting = () => {
	const { settings } = useSettings()
	return (
		<div className='flex w-full justify-between'>
			<label className='label'>
				<span className='label-text'>
					{SETTING_TEXT.theme[settings.language]}
				</span>
			</label>

			{/* TODO: join with 3 input type is radio not working,
          cause tailwind@3 not support this style in daisy ui, 
          need to upgrade to tailwind@4.*, but paslmo not support tailwind@4,
          may be migrate to wrt framwork*/}
			<ThemeControllerIconInside />
		</div>
	)
}

const LanguageSetting = () => {
	const { settings, updateSettings } = useSettings()
	const handleClick = (e) => {
		updateSettings({ language: e.target.value })
		document.activeElement.blur()
	}
	return (
		<div className='flex w-full justify-between'>
			<label className='label'>
				<span className='label-text'>
					{SETTING_TEXT.language[settings.language]}
				</span>
			</label>
			<span></span>
			<Dropdown
				dropdownButton={
					<button className='btn flex items-center'>
						{SETTING_TEXT.languageOptions[settings.language][settings.language]}
						<svg
							width='12px'
							height='12px'
							className='inline-block h-2 w-2 fill-current opacity-60'
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 2048 2048'
						>
							<path d='M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z'></path>
						</svg>
					</button>
				}
			>
				{LANGUAGE_OPTIONS.map((val) => {
					return (
						<li>
							<input
								key={"setting-lan-" + val}
								type='radio'
								name='theme-dropdown'
								className='theme-controller btn btn-ghost btn-sm btn-block w-full justify-start'
								aria-label={
									SETTING_TEXT.languageOptions[val][settings.language]
								}
								value={val}
								onClick={handleClick}
							/>
						</li>
					)
				})}
			</Dropdown>
		</div>
	)
}

const SettingTypeRenderer = ({ field, name, value }) => {
	if (name === "theme") return <ThemeSetting />
	if (name === "language") return <LanguageSetting />
	switch (typeof value) {
		case "boolean":
			return (
				<BooleanSetting
					field={field}
					name={name}
					value={value}
				/>
			)
		case "object":
			return (
				<FieldSettings
					name={name}
					value={value}
				/>
			)
		default:
			return <p>{value}</p>
	}
}

const SettingsPanel = () => {
	const { settings, updateSettings } = useSettings()

	return (
		<div className='settings-panel'>
			<form className='card-body'>
				{Object.entries(settings).map(([key, value]) => {
					// TODO: value is object
					return (
						<SettingTypeRenderer
							name={key}
							value={value}
							key={key}
						/>
					)
				})}
			</form>
		</div>
	)
}

export const SettingsButton = ({ className = "" }) => {
	const [isOpen, setIsOpen] = useState(false)
	const memoCancel = useCallback(() => setIsOpen(false), [])
	// const { settings, resetSettings } = useSettings() // TEST:
	return (
		<>
			<button
				className={"btn" + (className ? ` ${className}` : "")}
				onClick={() => {
					setIsOpen(true)
				}}
			>
				<Icon Svg={ToolsSvg} />
				Settings
			</button>
			<Modal
				isOpen={isOpen}
				cancelText='Close'
				onCancel={memoCancel}
				buttonPosition='center'
				// TODO: title='icon + setting' should be persisted with children at the same time
				// TEST:
				// confirmText="reset setting"
				// onConfirm={() => resetSettings()}
			>
				<SettingsPanel />
			</Modal>
		</>
	)
}
