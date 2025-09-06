import type { AppSettings } from "@/components/setting/settingContext"
import localforage from "localforage"

const SETTINGS = localforage.createInstance({
  name: "settings"
})

export const localSaveSettings = (settings: AppSettings): AppSettings => {
  SETTINGS.setItem("settings", settings)
  return settings
}

export const localGetSettings = (): Promise<AppSettings> => {
  return SETTINGS.getItem("settings")
}
