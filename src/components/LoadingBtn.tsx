import { useEffect, useState, type ReactNode } from "react"

type LoadingBtnProps = {
  onClick: (e?: any) => void | Promise<void>
  loadingTime?: number // 与 loading 二选一
  loading?: boolean
  children: ReactNode
  className?: string
  disabled?: boolean // ?
  Icon?: any
  iconClassName?: string
  text?: string
  textClassName?: string
}
// const defaultBtnClassName = "btn btn-outline btn-primary p-2"
const LoadingBtn: React.FC<LoadingBtnProps> = ({
  children,
  text,
  textClassName,
  Icon,
  iconClassName,
  onClick,
  loading,
  loadingTime,
  className = "btn",
  disabled = false
}) => {
  const [innerLoading, setInnerLoading] = useState(disabled)
  const [innerDisabled, setInnerDisabled] = useState(false)
  const content = children ? (
    children
  ) : (
    <>
      {Icon && <Icon className={iconClassName} />}
      {text && <span className={textClassName + " lg:inline"}>{text}</span>}
    </>
  )

  const handleClick = (e: any) => {
    if (loadingTime !== undefined && loading === undefined) {
      setInnerLoading(true)
      setInnerDisabled(true)

      loadingTime &&
        setTimeout(() => {
          setInnerDisabled(false)
          setInnerLoading(false)
        }, loadingTime)
    }
    console.log("handle click in laodingbutton")
    onClick && onClick(e)
  }

  useEffect(() => {
    setInnerLoading(loading)
    setInnerDisabled(loading)
  }, [loading])

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={innerDisabled}
    >
      {innerLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        content
      )}
    </button>
  )
}

export default LoadingBtn
