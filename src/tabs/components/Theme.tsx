import { useState } from "react"
import MoonFillSvg from "react:~assets/svg/moon-fill.svg"
import MoonSvg from "react:~assets/svg/moon.svg"
import SunFillSvg from "react:~assets/svg/sun-fill.svg"
import SunSvg from "react:~assets/svg/sun.svg"

import Icon from "./Icon"

const Theme = () => {
  const [isLight, setIsLight] = useState(true)

  const setTheme = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme)
  }
  const handleToggle = (e) => {
    if (e.target.checked) {
      setTheme("dark")
      setIsLight(false)
    } else {
      setTheme("default")
      setIsLight(true)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Icon
        Svg={isLight ? SunFillSvg : SunSvg}
        className="h-6 w-6 fill-slate-700"
      />
      <input
        type="checkbox"
        className="toggle border-primary bg-primary"
        onChange={handleToggle}
      />
      <Icon
        Svg={isLight ? MoonSvg : MoonFillSvg}
        className="h-6 w-6 fill-slate-700"
      />
    </div>
  )
}

export default Theme
