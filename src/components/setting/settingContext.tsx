import { createContext, memo, useContext } from "react"
// import { createContext } from "use-context-selector"
// 1. 定义类型和默认值
// type Theme = "light" | "dark" | "system"
type Theme = boolean // false: light, true: dark
type Language = "en" | "cn"

export interface AppSettings {
	theme: Theme
	language: Language
	dndEnabled: boolean
	confirm: {
		conformClosingTabs: boolean
		confirmClosingWindows: boolean
		confirmDeletingTabs: boolean
		confirmDeletingWindows: boolean
		confirmDeletingColelctions: boolean
	}
	ignore: {
		ignoreSelf: boolean
		ignoreNewTabs: boolean
	}
	dev?: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
	theme: false,
	language: "cn",
	dndEnabled: true,
	confirm: {
		conformClosingTabs: true,
		confirmClosingWindows: true,
		confirmDeletingTabs: true,
		confirmDeletingWindows: true,
		confirmDeletingColelctions: true,
	},
	ignore: {
		ignoreSelf: false,
		ignoreNewTabs: false,
	},
	dev: false,
}

export const LANGUAGE_OPTIONS = ["en", "cn"]

export const SETTING_TEXT = {
	theme: { cn: "主题", en: "Theme" },
	language: { cn: "语言", en: "Language" },
	languageOptions: {
		en: { cn: "英文", en: "en" },
		cn: { cn: "中文", en: "cn" },
	},
	dndEnabled: { cn: "启用拖拽", en: "Enable drag and drop" },
	confirm: { cn: "确认", en: "Confirm" },
	conformClosingTabs: {
		cn: "关闭标签页时确认",
		en: "Confirm when closing tabs",
	},
	confirmClosingWindows: {
		cn: "关闭窗口时确认",
		en: "Confirm when closing windows",
	},
	confirmDeletingTabs: {
		cn: "删除标签页时确认",
		en: "Confirm when deleting tabs",
	},
	confirmDeletingWindows: {
		cn: "删除窗口时确认",
		en: "Confirm when deleting windows",
	},
	confirmDeletingColelctions: {
		cn: "删除集合时确认",
		en: "Confirm when deleting collections",
	},
	ignore: { cn: "忽略", en: "Ignore" },
	ignoreSelf: { cn: "忽略自己", en: "Ignore self" },
	ignoreNewTabs: { cn: "忽略新标签页", en: "Ignore new tabs" },
	dev: { cn: "dev", en: "dev" },
}

// 2. 创建 Context
export const SettingsContext = createContext<{
	settings: AppSettings
	updateSettings: (newSettings: Partial<AppSettings>) => void
	resetSettings: () => void
}>({
	settings: DEFAULT_SETTINGS,
	updateSettings: () => {},
	resetSettings: () => {},
})

// 3. 创建 Provider 组件

// 4. 创建自定义 Hook
export const useSettings = () => useContext(SettingsContext)

// 5. 在根组件包裹 Provider

// 6. 创建设置界面组件

// 7. 在组件中使用设置
function ThemeWrapper({ children }) {
	const { settings } = useSettings()

	return <div className={`theme-${settings.theme}`}>{children}</div>
}

// 8. 优化组件更新（使用 memo）
const NotificationBadge = memo(() => {
	const { settings } = useSettings()

	if (!settings.notificationsEnabled) return null

	return <div className='notification-badge'>...</div>
})
