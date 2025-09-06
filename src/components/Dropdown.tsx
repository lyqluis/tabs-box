/*
  This is hacky for tailwindcss can't generate css rules for dynamic classname in the component:
  Ensure Tailwind generates these classes:
  dropdown-top dropdown-bottom dropdown-left dropdown-right
  dropdown-start dropdown-center dropdown-end
*/

import {
  cloneElement,
  FC,
  isValidElement,
  ReactElement,
  ReactNode,
  useRef
} from "react"

interface DropdownProps {
  direction?: "bottom" | "top" | "left" | "right"
  position?: "strat" | "center" | "end"
  dropdownButton: ReactNode // 触发 dropdown 的元素 (button, span, etc.)
  children: ReactNode
  isOpen?: boolean // 外部控制 dropdown 是否打开
  onOpen?: () => void // dropdown 打开时的回调
  onClose?: () => void // dropdown 关闭时的回调
  className?: string // 额外的 CSS 类名添加到 dropdown 容器
  dropdownClassName?: string // 额外的 CSS 类名添加到 dropdown 内容容器
  portalTarget?: HTMLElement // portal 渲染的目标元素，默认为 document.body
  closeOnOutsideClick?: boolean // 点击外部是否关闭 dropdown，默认为 true
}

const Dropdown: FC<DropdownProps> = ({
  direction = "bottom",
  position = "start",
  children,
  dropdownButton,
  isOpen: controlledIsOpen, // 使用 controlledIsOpen 避免与内部 state 变量名冲突
  className,
  dropdownClassName
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tabIndex = 0

  // 确保 dropdownButton 是一个 React Element 并且可以被克隆和添加属性
  const button = isValidElement(dropdownButton)
    ? cloneElement(dropdownButton, {
        tabIndex: tabIndex,
        ...((dropdownButton as ReactElement).props || {}) // 保留原有的 props
      })
    : dropdownButton

  const dropdownContent = (
    <div
      tabIndex={tabIndex}
      ref={dropdownRef}
      className={
        "menu dropdown-content rounded-box bg-base-100 z-[1] max-h-[50vh] w-max flex-col flex-nowrap overflow-y-scroll p-2 shadow-xl" +
        (dropdownClassName ? ` ${dropdownClassName}` : "")
      }
    >
      {children}
    </div>
  )

  return (
    <div
      className={
        `dropdown dropdown-${direction} dropdown-${position}` +
        (className ? ` ${className}` : "")
      }
    >
      {button}
      {dropdownContent}
    </div>
  )
}

export default Dropdown
