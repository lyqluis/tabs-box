import { useEffect, useState, type ReactNode } from "react"
import {
	DEFAULT_SETTINGS,
	SettingsContext,
	type AppSettings,
} from "./settingContext"
import { localGetSettings, localSaveSettings } from "@/store"

const { Provider } = SettingsContext
export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

	const getLocalSettings = async () => {
		const savedSettings = await localGetSettings()
		if (savedSettings) setSettings(savedSettings)
	}

	useEffect(() => {
		getLocalSettings()
	}, [])

	const updateSettings = (newSettings: Partial<AppSettings>) => {
		setSettings((prev) => {
			console.log("update settings", prev, newSettings)
			const merged = { ...prev, ...newSettings }
			localSaveSettings(merged)
			return merged
		})
	}

	// TEST:
	const resetSettings = useCallback(() => {
		setSettings(DEFAULT_SETTINGS)
		localSaveSettings(DEFAULT_SETTINGS)
	}, [DEFAULT_SETTINGS])

	return (
		<Provider value={{ settings, updateSettings, resetSettings }}>
			{children}
		</Provider>
	)
}
