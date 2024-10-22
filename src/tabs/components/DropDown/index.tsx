import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type ReactNode
} from "react"
import { createPortal } from "react-dom"

const initStyle = {
  left: "-99999px",
  top: "-99999px",
  opacity: 0,
  transform: "scale(0.95)",
  transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
  transitionDuration: "200ms",
  transitionProperty: "opacity, transform"
}

type DropdownProps = {
  children: ReactNode
  listClassName?: string
  button?: ReactNode
  buttonText?: string
  buttonClassName?: string
  buttonStyle?: CSSProperties
}

const Dropdown: FC<DropdownProps> = ({
  buttonText,
  buttonClassName,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<any>(initStyle)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const handleToggle = () => setIsOpen(!isOpen)

  const handleClickOutside = (event) => {
    // 如果点击事件的目标不是 button/menu 单本身，则关闭下拉菜单
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !buttonRef.current.contains(event.target)
    ) {
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
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      setMenuStyle({
        ...menuStyle,
        top: `${buttonRect.bottom + 5}px`,
        left: `${buttonRect.left}px`,
        transform: "scale(1)",
        opacity: 1
      })
    } else if (!isOpen) {
      setMenuStyle(initStyle)
    }
  }, [isOpen])

  const DropDownMenu = createPortal(
    <div
      style={menuStyle}
      ref={menuRef}
      className="menu dropdown-content absolute z-[1] max-h-[50vh] flex-col flex-nowrap overflow-y-scroll rounded-box bg-base-100 p-2 shadow"
      onClick={handleToggle}
    >
      {children}
    </div>,
    document.body
  )

  return (
    <>
      <button
        ref={buttonRef}
        className={buttonClassName}
        onClick={handleToggle}
      >
        {buttonText ?? "dropdown"}
      </button>
      {isOpen && DropDownMenu}
    </>
  )
}

export default Dropdown
