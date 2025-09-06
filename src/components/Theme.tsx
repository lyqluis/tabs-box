import MoonFillSvg from "@/assets/svg/moon-fill.svg?react"
import MoonSvg from "@/assets/svg/moon.svg?react"
import SunFillSvg from "@/assets/svg/sun-fill.svg?react"
import SunSvg from "@/assets/svg/sun.svg?react"
import { useEffect, useState } from "react"

import Icon from "./Icon"
import { useSettings } from "./setting/settingContext"

const useTheme = () => {
  const { settings, updateSettings } = useSettings()
  const [isDark, setIsDark] = useState(settings.theme ?? false)

  const setTheme = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme)
  }
  const handleToggle = (e) => {
    const checked = e.target.checked
    setIsDark(checked)
    updateSettings({ theme: checked })
    setTheme(checked ? "dark" : "default")
  }

  useEffect(() => {
    setIsDark(settings.theme)
    setTheme(settings.theme ? "dark" : "default")
  }, [settings.theme])

  return { isDark, handleToggle }
}

export const ThemeController = ({ className }) => {
  const { isDark, handleToggle } = useTheme()

  return (
    <div
      className={"flex items-center gap-1" + (className ? ` ${className}` : "")}
    >
      <Icon Svg={isDark ? SunSvg : SunFillSvg} width={6} height={6} />
      <input
        type="checkbox"
        checked={isDark}
        className="toggle border-primary"
        onChange={handleToggle}
      />
      <Icon Svg={isDark ? MoonFillSvg : MoonSvg} width={6} height={6} />
    </div>
  )
}

export const ThemeControllerIconInside = () => {
  const { isDark, handleToggle } = useTheme()
  return (
    <label className="toggle text-primary">
      <input
        type="checkbox"
        checked={isDark}
        className="theme-controller"
        onChange={handleToggle}
      />

      <svg
        aria-label="sun"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <g
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="2"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </g>
      </svg>

      <svg
        aria-label="moon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <g
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="2"
          fill="none"
          stroke="currentColor"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </g>
      </svg>
    </label>
  )
}
