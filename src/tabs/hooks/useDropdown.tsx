import { useEffect, useRef, useState, type FC } from "react"
import { createPortal } from "react-dom"

type UseDropdownProps = {
  listClassName?: string
  menuPosition?: "left" | "right"
}
// interface useDropdownProps {
//   listClassName?: string
//   menuPosition?: "left" | "right"
// }
type DropdownProps = {
  children: React.ReactNode
  className?: string
}

const useDropdown = (
  { menuPosition = "left" }: UseDropdownProps = { menuPosition: "left" }
) => {
  const initStyle = {
    [menuPosition]: "-99999px",
    top: "-99999px",
    opacity: 0,
    transform: "scale(0.95)",
    transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
    transitionDuration: "200ms",
    transitionProperty: "opacity, transform"
  }
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<any>(initStyle)
  const toggleRef = useRef(null)
  const menuRef = useRef(null)

  const handleToggle = (open?: boolean) => {
    setIsOpen(open ?? !isOpen)
  }

  const handleClickOutside = (event) => {
    // console.log("handle click outside")
    // 如果点击事件的目标不是 button/menu 单本身，则关闭下拉菜单
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !toggleRef.current.contains(event.target)
    ) {
      // console.log("handle click outside inner")
      setIsOpen(false)
    }
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    document.body.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.body.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && toggleRef.current) {
      const buttonRect = toggleRef.current.getBoundingClientRect()

      setMenuStyle({
        ...menuStyle,
        top: `${buttonRect.bottom + 5}px`,
        [menuPosition]: `${menuPosition === "right" ? window.innerWidth - buttonRect[menuPosition] : buttonRect[menuPosition]}px`,
        transform: "scale(1)",
        opacity: 1
      })
    } else if (!isOpen) {
      setMenuStyle(initStyle)
    }
  }, [isOpen])

  const Dropdown: FC<DropdownProps> = ({ children, className }) => {
    return isOpen
      ? createPortal(
          <div
            style={menuStyle}
            ref={menuRef}
            className={
              "menu dropdown-content absolute z-[1] max-h-[50vh] flex-col flex-nowrap overflow-y-scroll rounded-box bg-base-100 p-2 shadow" +
              (className ? ` ${className}` : "")
            }
            onClick={() => handleToggle()}
          >
            {children}
          </div>,
          document.body
        )
      : null
  }

  return {
    Dropdown,
    toggleRef, // use in toggle node outside
    handleToggle
  }
}

export default useDropdown
