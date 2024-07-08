import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactNode
} from "react"

type DropDownProps = {
  children: ReactNode
  listClassName?: string
  button?: ReactNode
  buttonText?: string
  buttonClassName?: string
  buttonStyle?: CSSProperties
}

const DropDown = forwardRef((props: DropDownProps, ref: any) => {
  const { listClassName, buttonClassName, buttonStyle, buttonText, children } =
    props
  const activeRef = useRef(null)

  const listClass =
    listClassName ??
    "menu dropdown-content z-[1] max-h-[50vh] flex-col flex-nowrap overflow-y-scroll rounded-box bg-base-100 p-2 shadow"
  const buttonClass = buttonClassName ?? "btn btn-xs m-1"

  useImperativeHandle(ref, () => ({
    close: () => (activeRef.current.open = false)
  }))

  return (
    <details className="dropdown" ref={activeRef}>
      <summary style={buttonStyle} className={buttonClass}>
        {buttonText}
      </summary>
      <ul className={listClass}>{children}</ul>
    </details>
  )
})

export default DropDown
