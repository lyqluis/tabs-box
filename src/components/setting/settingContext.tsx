import ToolsSvg from "@/assets/svg/tools.svg?react"
import Modal from "@/components/Modal"
import { ThemeControllerIconInside } from "@/components/Theme"
import { localGetSettings, localSaveSettings } from "@/store"
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react"

import Dropdown from "../Dropdown"
import Icon from "../Icon"

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

const DEFAULT_SETTINGS: AppSettings = {
  theme: false,
  language: "cn",
  dndEnabled: true,
  confirm: {
    conformClosingTabs: true,
    confirmClosingWindows: true,
    confirmDeletingTabs: true,
    confirmDeletingWindows: true,
    confirmDeletingColelctions: true
  },
  ignore: {
    ignoreSelf: false,
    ignoreNewTabs: false
  },
  dev: false
}

const LANGUAGE_OPTIONS = ["en", "cn"]

const SETTING_TEXT = {
  theme: { cn: "主题", en: "Theme" },
  language: { cn: "语言", en: "Language" },
  languageOptions: {
    en: { cn: "英文", en: "en" },
    cn: { cn: "中文", en: "cn" }
  },
  dndEnabled: { cn: "启用拖拽", en: "Enable drag and drop" },
  confirm: { cn: "确认", en: "Confirm" },
  conformClosingTabs: {
    cn: "关闭标签页时确认",
    en: "Confirm when closing tabs"
  },
  confirmClosingWindows: {
    cn: "关闭窗口时确认",
    en: "Confirm when closing windows"
  },
  confirmDeletingTabs: {
    cn: "删除标签页时确认",
    en: "Confirm when deleting tabs"
  },
  confirmDeletingWindows: {
    cn: "删除窗口时确认",
    en: "Confirm when deleting windows"
  },
  confirmDeletingColelctions: {
    cn: "删除集合时确认",
    en: "Confirm when deleting collections"
  },
  ignore: { cn: "忽略", en: "Ignore" },
  ignoreSelf: { cn: "忽略自己", en: "Ignore self" },
  ignoreNewTabs: { cn: "忽略新标签页", en: "Ignore new tabs" },
  dev: { cn: "dev", en: "dev" }
}

// 2. 创建 Context
const SettingsContext = createContext<{
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  resetSettings: () => void
}>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {}
})

// 3. 创建 Provider 组件
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

// 4. 创建自定义 Hook
export const useSettings = () => useContext(SettingsContext)

// 5. 在根组件包裹 Provider

// TODO: finish setting function
// 6. 创建设置界面组件
const BooleanSetting = ({ field, name, value }) => {
  const { settings, updateSettings } = useSettings()
  return (
    <div className="flex w-full items-center justify-between">
      <label className="label">
        <span className="label-text">
          {SETTING_TEXT[name][settings.language] ?? name}
        </span>
      </label>

      <input
        type="checkbox"
        className="toggle toggle-primary border-primary"
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
      <div className="flex w-full flex-col justify-between">
        <h3 className="text-sm font-semibold">
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
    <div className="flex w-full justify-between">
      <label className="label">
        <span className="label-text">
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
    <div className="flex w-full justify-between">
      <label className="label">
        <span className="label-text">
          {SETTING_TEXT.language[settings.language]}
        </span>
      </label>
      <span></span>
      <Dropdown
        dropdownButton={
          <button className="btn flex items-center">
            {SETTING_TEXT.languageOptions[settings.language][settings.language]}
            <svg
              width="12px"
              height="12px"
              className="inline-block h-2 w-2 fill-current opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </button>
        }
      >
        {LANGUAGE_OPTIONS.map((val) => {
          return (
            <li>
              <input
                key={"setting-lan-" + val}
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-ghost btn-sm btn-block w-full justify-start"
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
      return <BooleanSetting field={field} name={name} value={value} />
    case "object":
      return <FieldSettings name={name} value={value} />
    default:
      return <p>{value}</p>
  }
}

const SettingsPanel = () => {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="settings-panel">
      <form className="card-body">
        {Object.entries(settings).map(([key, value]) => {
          // TODO: value is object
          return <SettingTypeRenderer name={key} value={value} key={key} />
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
        cancelText="Close"
        onCancel={memoCancel}
        buttonPosition="center"
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

// 7. 在组件中使用设置
function ThemeWrapper({ children }) {
  const { settings } = useSettings()

  return <div className={`theme-${settings.theme}`}>{children}</div>
}

// 8. 优化组件更新（使用 memo）
const NotificationBadge = memo(() => {
  const { settings } = useSettings()

  if (!settings.notificationsEnabled) return null

  return <div className="notification-badge">...</div>
})
